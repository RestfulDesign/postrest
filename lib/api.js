/*global require exports */

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

var API = {};

function use(api) {

    if (Array.isArray(api)) {
        api.forEach(use);
    } else if (typeof api === 'object') {
        for (var ns in api) {
            register(ns, api[ns]);
        }
    } else if (typeof api === 'string') {
        api = require(api);

        use(api);
    } else {
        throw new TypeError(typeof api);
    }
}

exports.use = use;

function register(ns, api) {
    if (!Object.getOwnPropertyDescriptor(API, ns)) {
        API[ns] = api;
    } else {
        if (!API[ns]) API[ns] = api;
        else if (API[ns] !== api) throw new Error(ns + " api already registered");
    }
}

exports.register = register;

function list() {
    var apis = [];

    for (var ns in API) apis.push(ns);

    return apis;
}

exports.list = list;

function load(db, api) {
    if (!db) return;

    if (api && typeof api === 'string') {
        // load single api
        if (!API[api])
            throw new Error(api + " api not registered");
        else db[api] = attach(db, api, API[api]);
    } else {
        // load everything
        for (var ns in API)
            db[ns] = attach(db, ns, API[ns]);
    }
}

exports.load = load;

function attach(db, ns, api) {

    Object.defineProperty(db, ns, {
        enumerable: true,
        configurable: true,
        get: function() {
            return context();
        }
    });

    function context() {
        var instance = api(db);

        proxyMethods(db, instance);

        context = function() {
            return instance;
        };

        return instance;
    }
}

// Allows api methods to set addional headers and urlOptions
// using {_headers:{}, _options:{}}.
// db.api.method('test',true,{
//    _options: {a:42,b:"hello"}, 
//    _headers:{"x-something":"must have"} 
// });
//
function proxyMethods(db, instance) {
    Object.keys(instance).forEach(function(method) {
        var api_method = instance[method];

        if (typeof api_method === 'function') {

            instance[method] = function() {
                var args = [].slice.call(arguments),
                    arg, i;

                if ((i = args.length)) {
                    arg = args[i - 1];

                    if (isObject(arg)) {
                        if (arg.hasOwnProperty('_headers')) {
                            db._headers = arg._headers;
                            delete arg._headers;
                        }

                        if (arg.hasOwnProperty('_options')) {
                            db._options = arg._options;
                            delete arg._options;
                        }
                    }
                }

                try {
                    return api_method.apply(instance, args);
                } catch (e) {
                    throw e;
                } finally {
                    db._headers = undefined;
                    db._options = undefined;
                }

                // should never reach here
                throw new Error("unexpected return");
            };

        } else if (typeof api_method === 'object') {
            proxyMethods(db, api_method);
        }
    });
}

function isObject(o) {
    return typeof o === 'object' && o !== null && !Array.isArray(o);
}
