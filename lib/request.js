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

    function dbError(e) {
        this.name = 'db_error';

        if(utils.isObject(e)) {
            this.error = e.error;
            this.code = e.code;
            this.status = e.status;
            this.message = e.message;
        } else {
            this.message = e.toString();
        }
    }

    dbError.prototype = Object.create(Error.prototype);
    dbError.prototype.constructor = dbError;


    /* Bring in Xhr support for nodejs or browser */
    if(!isBrowser) {
        var http = require('http');
        var agent = new http.Agent({
            keepAlive: true,
            maxSockets: 1
        });

        httpRequest = function (method, path, data, options, resolver) {

            var url = utils.url.parse(path);
            var proto = (url.host && url.host.protocol) || options.host.protocol;
            var request = require(proto).request;

            var o = {};

            if(data && typeof data !== 'string') {
                try {
                    data = JSON.stringify(data);
                } catch(error) {
                    reply(resolver, error);
                }
            }

            if(options.timeout) {
                request.socket.setTimeout(options.timeout);
            }

            o.method = method || 'GET';
            o.hostname = options.host.hostname;
            o.port = options.host.port;
            o.path = url.toString();
            o.agent = agent;

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
                    reply(resolver, undefined, error);
                });
            }

            // debug request
            //console.log("%s %s: data->%s headers->%j", o.method, o.path, data, o.headers);

            request(o, response)
                .on('error', function (error) {
                    reply(resolver, undefined, error);
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
                reply(resolver, undefined, error);
            });
        };
    }

    function reply(resolver, data, response) {
        var message = {},
            result;

        if(response instanceof Error) {
            return resolver(response, data);
        }

        message.headers = response.hasOwnProperty('headers') ? response.headers : {};

        // JSON parse returned data if content type is json
        if(typeof data === 'string' &&
            message.headers.hasOwnProperty('content-type') &&
            message.headers['content-type'].indexOf('json') > 0) {
            result = JSON.parse(data); // throws on failure
        }

        utils.extend(true, message, result);

        // normalize status code
        message.status = response.hasOwnProperty('statusCode') ? response.statusCode : response.status;

        // success
        if(message.status > 0 && message.status < 400) {
            return resolver(undefined, message);
        }

        // failure
        message.error = new dbError(result);

        return resolver(message.error, message);
    }

    return httpRequest;
}());