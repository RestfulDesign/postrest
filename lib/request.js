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

            //console.log("%j", o);

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

    function dbError(e) {
        this.name = 'dbError';
        this.error = e.error;
        this.code = e.code;
        this.status = e.status;
        this.message = this.name + '(' + e.error +
            ') status(' + e.status +
            ') code(' + e.code +
            '); ' + e.message;
    }

    dbError.prototype = Object.create(Error.prototype);
    dbError.prototype.constructor = dbError;

    function reply(resolver, data, response) {
        var error, status, message = {};

        // normalize response status code
        message.status = response ? (response.statusCode || response.status) : -1;
        message.headers = response && response.hasOwnProperty('headers') ? response.headers : {};

        // attempt to JSON parse returned data
        if(typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch(e) {
                /* data as text/html */
            }
        }

        message.result = data;
        message.type = Array.isArray(data) ? 'array' : typeof data;

        // success
        if(message.status > 0 && message.status < 400) {
            return resolver(undefined, message);
        }

        // failure
        error = message.result;
        // create dbError
        if(!(error instanceof Error)) {
            error = new dbError(error);
        }

        message.error = error;

        return resolver(message.error, message);
    }

    function isObject(o) {
        return typeof o === 'object' && o !== null && !Array.isArray(o);
    }

    return httpRequest;
}());