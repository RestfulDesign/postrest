/*global require module process Buffer */

/* 
 * Copyright (c) 2015 RestfulDesign (restfuldesign.com),
 * created by Anders Elo <anders @ restfuldesign com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        httpRequest = function (method, path, data, options, resolver) {

            var url = utils.url.parse(path);
            var proto = (url.host && url.host.protocol) || options.host.protocol;
            var request = require(proto).request;

            var o = {};

            if(options.timeout) {
                request.socket.setTimeout(options.timeout);
            }

            o.method = method || 'GET';
            o.hostname = options.host.hostname;
            o.port = options.host.port;
            o.path = url.toString();

            o.headers = utils.extend({}, options.headers);
            o.headers['content-length'] = data ? Buffer.byteLength(data) : 0;
            o.headers['connection'] = 'keep-alive';

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
            console.log("%j", o);
            request(o, response)
                .on('error', function (error) {
                    reply(resolver, error);
                }).end(data, options.encoding);
        };
    } else {
        httpRequest = function (method, path, data, options, resolver) {

            var ajax = require('./ajax'),
                buf;

            ajax(method, path, data, options).when(function (httpResponse) {
                buf = httpResponse.responseText;
                reply(resolver, buf, httpResponse);
            }, function (error) {
                reply(resolver, error);
            });
        };
    }

    function reply(resolver, data, response) {
        var error;

        // normalize response status code
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