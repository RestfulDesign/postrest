/*global require module XDomainRequest setTimeout */

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

// NOTE: this module is targeted for browsers

module.exports = (function() {

    var utils = require('./utils');

    var DEFAULT_TIMEOUT = 5000;

    // get xhr constructor
    var Xhr = (function() {

        if (window.XDomainRequest) {

            return window.XDomainRequest;
        } else if (window.XMLHttpRequest) {

            return window.XMLHttpRequest;
        } else if (window.ActiveXObject) {

            ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP'].forEach(function(x) {
                try {
                    return window.ActiveXObject(x);
                } catch (e) {}
            });

            throw new Error('XHR ActiveXObject failed');
        }

        throw new Error('XHR support not found');
    }());

    // ReadyState status codes
    var XHR_CLOSED = 0,
        XHR_OPENED = 1,
        XHR_SENT = 2,
        XHR_RECEIVED = 3,
        XHR_DONE = 4;

    function Ajax(method, url, data, options, callback) {
        var xhr = new Xhr(),
            headers;

        if (typeof options === 'function') {
            callback = options;
            options = data;
            data = undefined;
        } else if (typeof data === 'function') {
            callback = data;
            options = undefined;
            data = undefined;
        }

        options = options || {};

        if (options.async == undefined) options.async = true;

        if (options.timeout == undefined) options.timeout = DEFAULT_TIMEOUT;

        if (!options.headers) options.headers = {};

        if (options.type || !options.headers['content-type'])
            options.headers['content-type'] = options.type || 'application/json';

        if (options.accept || !options.headers.accept)
            options.headers.accept = options.accept || 'application/json';

        if (options.charset) options.headers['accept-charset'] = options.charset;

        if ("withCredentials" in xhr || XDomainRequest != undefined) {

            if (options.withCredentials === true)
                xhr.withCredentials = true;

            xhr.onload = function() {
                callback(undefined, xhr);
            };
            xhr.onerror = function() {
                callback(xhr);
            };
        } else {
            xhr.onreadystatechange = function() {
                switch (xhr.readyState) {
                    case XHR_DONE:
                        if (xhr.status) callback(undefined, xhr);
                        else callback(xhr); // timeout or XDomain error
                        break;
                }
            };
        }

        // getter for response headers
        Object.defineProperty(xhr, 'headers', {
            get: function() {
                if (!headers)
                    headers = parseHeaders(xhr.getAllResponseHeaders());

                return headers;
            }
        });

        // response timeout
        if (options.timeout) {
            setTimeout(function() {
                xhr.abort();
            }, options.timeout);
        }

        // report progress
        if (xhr.upload) {
            xhr.upload.onprogress = function(e) {
                e.percent = e.loaded / e.total * 100;
                callback(0, e);
            };
        }

        // parse url
        url = utils.url.parse(url);

        if (!url.host) url.host = {};

        // merge host info with options
        if (!url.host.protocol && options.protocol) url.host.protocol = options.protocol;
        if (!url.host.hostname && options.hostname) url.host.hostname = options.hostname;
        if (!url.host.port && options.port) url.host.port = options.port;

        url = url.toString();

        try {
            xhr.open(method, url, options.async);
        } catch (error) {
            xhr = null;
            callback(error);

            return;
        }

        // set request headers 
        Object.keys(options.headers).forEach(function(header) {
            xhr.setRequestHeader(header, options.headers[header]);
        });

        // stringify data
        if (data != undefined &&
            typeof data !== 'string' &&
            options.headers['content-type'].indexOf('json') >= 0) {

            try {
                data = JSON.stringify(data);
            } catch (error) {
                xhr = undefined; // dereference 
                callback(error);

                return;
            }
        }

        // send http request 
        try {
            xhr.send(data);

            // sync mode
            if (!options.async) {
                if (xhr.status) callback(undefined, xhr);
                else callback(xhr);
            }
        } catch (error) {
            xhr = null;
            callback(error);
        }

    }

    // Object.create polyfill incase we don't have that
    if (!Object.create) {
        Object.create = (function() {
            function F() {}

            return function(o) {
                F.prototype = o;
                return new F();
            };
        })();
    }

    function parseHeaders(h) {
        var ret = Object.create(null),
            key, val, i;

        h.split('\n').forEach(function(header) {
            if ((i = header.indexOf(':')) > 0) {
                key = header.slice(0, i).replace(/^[\s]+|[\s]+$/g, '').toLowerCase();
                val = header.slice(i + 1, header.length).replace(/^[\s]+|[\s]+$/g, '');
                if (key && key.length) ret[key] = val;
            }
        });

        return ret;
    }

    ['head', 'get', 'put', 'post', 'delete', 'patch', 'trace', 'connect', 'options']
    .forEach(function(method) {
        Ajax[method] = function(url, data, options, res) {
            return Ajax(method, url, data, options, res);
        };
    });

    module.exports = Ajax;
}());
