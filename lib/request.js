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
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);

        this.name = 'dbError';
        this.data = e;

        if(utils.isObject(e)) {
            this.code = e.code || 1;
            this.error = e.error;
            this.status = e.status;
            this.message = e.message;
        } else {
            this.code = 0;
            this.status = 0;
            this.error = typeof e;
            this.message = e;
        }
    }

    dbError.prototype = Object.create(Error.prototype);
    dbError.prototype.constructor = dbError;

    var HTTP_STATUS_CODES = {
        '0'   : 'Timed out',
        '200' : 'OK',
        '201' : 'Created',
        '202' : 'Accepted',
        '203' : 'Non-Authoritative Information',
        '204' : 'No Content',
        '205' : 'Reset Content',
        '206' : 'Partial Content',
        '300' : 'Multiple Choices',
        '301' : 'Moved Permanently',
        '302' : 'Found',
        '303' : 'See Other',
        '304' : 'Not Modified',
        '305' : 'Use Proxy',
        '307' : 'Temporary Redirect',
        '400' : 'Bad Request',
        '401' : 'Unauthorized',
        '402' : 'Payment Required',
        '403' : 'Forbidden',
        '404' : 'Not Found',
        '405' : 'Method Not Allowed',
        '406' : 'Not Acceptable',
        '407' : 'Proxy Authentication Required',
        '408' : 'Request Timeout',
        '409' : 'Conflict',
        '410' : 'Gone',
        '411' : 'Length Required',
        '412' : 'Precondition Failed',
        '413' : 'Request Entity Too Large',
        '414' : 'Request-URI Too Long',
        '415' : 'Unsupported Media Type',
        '416' : 'Requested Range Not Satisfiable',
        '417' : 'Expectation Failed',
        '500' : 'Internal Server Error',
        '501' : 'Not Implemented',
        '502' : 'Bad Gateway',
        '503' : 'Service Unavailable',
        '504' : 'Gateway Timeout',
        '505' : 'HTTP Version Not Supported'
    };

    /* Bring in Xhr support for nodejs or browser */
    if(!isBrowser) {
        var agent = {};

        httpRequest = function (method, path, data, options, resolver) {
            var url = utils.url.parse(path),
                proto = (url.host && url.host.protocol) || options.host.protocol,
                request = require(proto).request,
                transmit;

            if(!agent.hasOwnProperty(proto)) {
                var protocol = require(proto);
                agent[proto] = new protocol.Agent({
                    keepAlive: options.keepalive || true,
                    maxSockets: options.maxSockets || 1
                });
            }

            var o = {};

            if(data && typeof data !== 'string') {
                try {
                    data = JSON.stringify(data);
                } catch(error) {
                    reply(resolver, error);
                }
            }          

            o.method = method || 'GET';
            o.hostname = options.host.hostname;
            o.port = options.host.port;
            o.path = url.toString();
            o.agent = agent[proto];

            o.headers = utils.extend({}, options.headers);
            o.headers['content-length'] = data ? Buffer.byteLength(data) : 0;
            
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
            transmit = request(o, response)
                .on('error', function (error) {
                    reply(resolver, undefined, error);
                }).end(data, options.encoding);

            if (options.timeout != undefined) {
                transmit.on('socket', function(socket) {
                    socket.setTimeout(options.timeout);

                    socket.on('timeout', function() {
                        reply(resolver,undefined,new dbError({
                            code: 1,
                            status: 0,
                            error: 'TIMEOUT_ERROR',
                            message: 'operation timedout'
                        }));
                        transmit.abort();
                    });
                });
            }
        };
    } else {
        httpRequest = function (method, path, data, options, resolver) {
            var ajax = require('./ajax');

            try {
                ajax(method, path, data, options, function (error, response) {
                    if(error) reply(resolver, undefined, error);
                    else reply(resolver, response.responseText, response);
                });
            } catch (error) {
                reply(resolver, undefined, error);
            }
            
        };
    }

    function reply(resolver, data, response) {
        var message = {},
            result,
            error;

        if(response instanceof Error) {
            resolver.reject(response);

            return;
        }

        message.headers = response.hasOwnProperty('headers') ? response.headers : {};

        // normalize status code
        if(response.hasOwnProperty('statusCode')){
            message.status = response.statusCode;
        }

        // JSON parse returned data if content type is json
        if(typeof data === 'string' &&
            message.headers.hasOwnProperty('content-type') &&
            message.headers['content-type'].indexOf('json') >= 0) {
            try {
                result = JSON.parse(data);
            } catch(error) {
                resolver.reject(error);

                return;
            }
        } else {
            result = {message: data};
        }

        utils.extend(true, message, result);

        // success
        if(message.status > 0 && message.status < 400) {
            resolver.resolve(message);
        } else {
            // failure
            error = new dbError(message);

            if(!error.error){
                error.error = HTTP_STATUS_CODES[message.status];
            }
            
            resolver.reject(error);
        }
    }

    return httpRequest;
}());
