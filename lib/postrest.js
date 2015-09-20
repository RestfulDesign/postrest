/*global require module */

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

module.exports = (function() {
    "use strict";

    var Api = require('./api');
    var utils = require('./utils');
    var request = require('./request');
    var Connection = require('./connection');

    // note: this library depends on native Promises.
    // You can use an ES6 compliant polyfill that
    // exposes a global Promise() class.

    var ADAPTER_VERSION = 100; // v0.1.0 -> 00 01 00 <major.minor.tiny>


    Api.use(
        [
            require('./api/sql'),
            require('./api/database'),
            require('./api/document'),
            require('./api/collection'),
            require('./api/index'),
            require('./api/graph'),
            require('./api/batch'),
            require('./api/session')
        ]
    );

    function PostRest(url, options) {
        if (!(this instanceof PostRest)) {
            return new PostRest(url);
        }

        Api.load(this);

        this.connection = new Connection(url, options);
    }

    /* connection: <object>: PostRest || <string>: '<protocol>://[<username>:<password>@]<hostname>[:<port>][/<database>][#<schema>]'
     * credentials: { username:'<username>', password:'<password>', database: '<database>' }
     * note: credentials are defaulted from the connection
     */
    PostRest.Connection = function(connection, options) {
        var postrest, credentials;

        options = options || {};

        if (options.username) {
            credentials.username = options.username;
            credentials.password = options.password;
            delete options.username;
            delete options.password;
        }
        if (options.database) {
            credentials.database = options.database;
            delete options.database;
        }
        if (options.schema) {
            credentials.schema = options.schema;
            delete options.schema;
        }

        if (connection instanceof PostRest) postrest = connection;
        else postrest = new PostRest(connection, options);

        return (postrest.session.login(credentials)
            .then(function() {
                return postrest;
            }));
    };

    PostRest.prototype = {
        "api": function(ns) {
            if (!ns) return Api.list();

            Api.load(this, ns);

            return this;
        },
        "use": function(connection) {
            var newConnection = {};

            if (typeof connection === 'string') {
                connection = utils.url.parse(connection);
            }

            utils.extend(true, newConnection, this.connection, connection);

            return new PostRest(newConnection.toString());
        },
        "useDatabase": function(database, options) {
            return PostRest.Connection(this.use('/' + database), options);
        },
        "useCollection": function(collection) {
            return this.use(':' + collection);
        },
        "useSchema": function(schema) {
            return this.use('#' + schema);
        },
        "request": function(method, path, data, headers) {
            var options = {};

            utils.extend(options, this.connection, {
                headers: headers
            });

            return new Promise(function(resolve, reject) {
                request(method, path, data, options, {
                    resolve: resolve,
                    reject: reject
                });
            });
        },
        "setHeader": function(header, value) {
            if (typeof header === 'object') {
                utils.extend(true, this.connection.headers, header);
            } else if (typeof header === 'string') {
                if (typeof value === 'object') {
                    if (!value) {
                        delete this.connection.headers[header];
                    }
                } else {
                    this.connection.headers[header] = value.toString();
                }
            }
        },
        "adapter": ADAPTER_VERSION
    };



    Object.defineProperty(PostRest.prototype, '_database', {
        configurable: false,
        enumerable: false,
        get: function() {
            return this.connection.path.base || 'postgres';
        }
    });

    Object.defineProperty(PostRest.prototype, '_collection', {
        configurable: false,
        enumerable: false,
        get: function() {
            return this.connection.path.name || 'document';
        }
    });

    Object.defineProperty(PostRest.prototype, '_schema', {
        configurable: false,
        enumerable: false,
        get: function() {
            return this.connection.path.hash || 'public';
        }
    });


    ['get', 'put', 'post', 'patch', 'delete', 'head', 'options'].forEach(function(method) {
        PostRest.prototype[method] = function(path, data, headers) {

            var option;

            if (['get', 'head', 'options'].indexOf(method) >= 0) {
                headers = data;
                data = undefined;
            }

            if (this._headers) {
                headers = utils.extend(true, {}, headers, this._headers);
            }

            if (this._options) {
                option = utils.urlOptions(this._options);

                path += '&' + option.substr(1);
            }

            return this.request(method, path, data, headers);
        };
    });

    return PostRest;

})();
