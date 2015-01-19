/*global require module process Buffer */
var isBrowser;

/* detects if in nodejs or else assume we are in a browser */
try {
    isBrowser = !process.versions.node;
} catch(e) {
    isBrowser = true;
}

module.exports = (function () {
    "use strict";

    var utils = require('./utils'),
        httpRequest;

    /* Bring in Xhr support for nodejs or browser */
    if(!isBrowser) {
        var agents = {};
        var minVersion = Number(process.versions.node.split('.')[1]);

        httpRequest = function (method, path, options, data, resolver) {

            var url = utils.url.parse(path);
            var proto = (url.host && url.host.protocol) || options.host.protocol;
            var request = require(proto).request;

            var o = {};

            if(options.timeout) {
                request.socket.setTimeout(options.timeout);
            }

            o.hostname = options.host.hostname;
            o.port = options.host.port;
            o.path = url.toString();

            o.headers = utils.extend({}, options.headers);
            o.headers['content-length'] = data ? Buffer.byteLength(data) : 0;
            o.headers['connection'] = 'keep-alive';

            if(!agents[proto] && minVersion > 10) {
                agents[proto] = new(require(proto)).Agent({
                    maxSockets: 1
                });
            }
            if(agents[proto] && minVersion > 10) {
                options.agent = agents[proto];
            }

            function response(httpResponse) {
                var buf = [];

                httpResponse.on('data', function (chunk) {
                    buf[buf.length] = chunk;
                }).on('end', function () {
                    buf = buf.join('');
                    reply(resolver, buf, httpResponse);
                }).on('error', function (error) {
                    reply(resolver, error);
                });
            }

            request(o, response)
                .on('error', function (error) {
                    reply(resolver, error);
                }).end(data, options.encoding);
        };
    } else {
        httpRequest = function (method, path, options, data, resolver) {

            var ajax = require('./ajax'),
                buf;

            ajax(method, path, options, data).when(function (httpResponse) {
                buf = httpResponse.responseText;
                reply(resolver, buf, httpResponse);
            }, function (error) {
                reply(resolver, error);
            });
        };
    }

    function reply(resolver, data, response) {
        var error;

        // normalize response status
        response = isObject(response) ? response : {
            status: response || -1
        };

        response.status = response.statusCode || response.status;

        if(typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch(e) { /* pass data as is */ }
        }

        // success
        if(response && response.status > 0 && response.status < 400) {
            if(typeof resolver === 'function') {
                return resolver(undefined, data, response);
            }

            return resolver.resolve(data, response);
        }

        // failure
        error = data;
        if(typeof resolver === 'function') {
            if(!(error instanceof Error)) {
                if(isObject(error)) {
                    error = new Error(JSON.stringify(data));
                    for(var k in data)
                        error[k] = data[k];
                } else if(typeof error === 'string') {
                    error = new Error(data);
                } else {
                    error = new Error("unspecified httpResponse error");
                }
            }

            return resolver(error, response);
        }

        return resolver.reject(error, response);
    }

    function isObject(o) {
        return typeof o === 'object' && o !== null && !Array.isArray(o);
    }

    return httpRequest;
}());