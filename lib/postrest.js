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

module.exports = (function () {
    "use strict";

    var Connection = require('./connection');
    var Api = require('./api');
    var utils = require('./utils');
    var Promise = require('bluebird');
    var request = Promise.promisify(require('./request'));


    /* note: check against database adapter version using db.database.version */
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

    function PostRest(url) {
        if(!(this instanceof PostRest)) {
            return new PostRest(url);
        }

        Api.load(this);

        this.connection = new Connection(url);
    }

    /* connection: <object>: PostRest || <string>: '<protocol>://[<username>:<password>@]<hostname>[:<port>][/<database>][#<schema>]'
     * credentials: { username:'<username>', password:'<password>', database: '<database>' }
     * note: credentials are defaulted from the connection
     */
    PostRest.Connection = function (connection, credentials) {
        var postrest;

        if(connection instanceof PostRest) postrest = connection;
        else postrest = new PostRest(connection);

        return(postrest.session.login(credentials)
            .then(function () {
                return postrest;
            }));
    };

    PostRest.prototype = {
        "api": function (ns) {
            if(!ns) return Api.list();

            Api.load(this, ns);
        },
        "use": function (connection) {
            var newConnection = {};

            if(typeof connection === 'string') {
                connection = utils.url.parse(connection);
            }

            utils.extend(true, newConnection, this.connection, connection);

            return new PostRest(newConnection.toString());
        },
        "useDatabase": function(database,credentials) {
            return PostRest.Connection(this.use('/' + database), credentials);
        },
        "useCollection": function(collection) {
            return this.use(':' + collection);
        },
        "useSchema": function(schema) {
            return this.use('#' + schema);
        },
        "request": function (method, path, data, headers) {
            var options = {};

            utils.extend(options, this.connection, {
                headers: headers
            });

            return request(method, path, data, options);
        },
        "setHeader": function (header, value) {
            if(typeof header === 'object') {
                utils.extend(true, this.connection.headers, header);
            } else if(typeof header === 'string') {
                if(typeof value === 'object') {
                    if(!value) {
                        delete this.connection.headers[header];
                    }
                } else {
                    this.connection.headers[header] = value.toString();
                }
            }
        },
        "adapter": ADAPTER_VERSION,
        "Promise": Promise
    };



    Object.defineProperty(PostRest.prototype, '_database', {
        configurable: false,
        enumerable: false,
        get: function () {
            return this.connection.path.base || 'postgres';
        }
    });

    Object.defineProperty(PostRest.prototype, '_collection', {
        configurable: false,
        enumerable: false,
        get: function () {
            return this.connection.path.name ||  'document';
        }
    });

    Object.defineProperty(PostRest.prototype, '_schema', {
        configurable: false,
        enumerable: false,
        get: function () {
            return this.connection.path.hash || 'public';
        }
    });


    ['get', 'put', 'post', 'patch', 'delete', 'head', 'options'].forEach(function (method) {
        PostRest.prototype[method] = function (path, data, headers) {

            var option;

            if(['GET', 'DELETE', 'HEAD', 'OPTIONS'].indexOf(method) >= 0) {
                headers = data;
                data = undefined;
            }

            if(this._headers) {
                headers = utils.extend(true, {}, headers, this._headers);
            }

            if(this._options) {
                option = utils.urlOptions(this._options);

                path += '&' + option.substr(1);
            }

            return this.request(method.toUpperCase(), path, data, headers);
        };
    });

    return PostRest;

})();