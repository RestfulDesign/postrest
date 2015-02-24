/*global require module */

module.exports = (function () {
    "use strict";

    var Connection = require('./connection');
    var Api = require('./api');
    var utils = require('./utils');
    var request = require('./request');

    /* note: check against database adapter version using db.database.version */
    var ADAPTER_VERSION = 100; // v0.1.0 -> 00 01 00 <major.minor.tiny>


    Api.use(
        [
            require('./api/sql'),
            require('./api/database'),
            require('./api/document'),
            require('./api/collection'),
            require('./api/index'),
            require('./api/graph')
        ]
    );

    function PostRest(url) {
        if(!(this instanceof PostRest)) {
            return new PostRest(url);
        }

        Api.load(this);

        this.connection = new Connection(url);
    }

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

            return new PostRest(newConnection);
        },
        "request": function (method, path, data, headers, callback) {
            var options, resolver;

            if(['GET', 'HEAD', 'DELETE', 'OPTIONS'].indexOf(method) >= 0) {
                callback = headers;
                headers = data;
                data = undefined;
            }

            if(typeof callback !== 'function') {
                resolver = new utils.promise();
            }

            if(data && typeof data !== 'string') {
                try {
                    data = JSON.stringify(data);
                } catch(err) {
                    return resolver ? resolver.reject(err) : callback(err);
                }
            }

            options = utils.extend(true, {}, this.connection, {
                headers: headers
            });

            //console.log(method, path, data, options);

            request(method, path, data, options, resolver || callback);

            return resolver;
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
        "adapter": ADAPTER_VERSION
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
            return this.connection.path.name ||  'documents';
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
            var option, callback = this.__callback;

            if(this.__headers) {
                headers = utils.extend(true, {}, headers, this.__headers);
            }

            if(this.__options) {
                option = utils.urlOptions(this.__options);

                path += '&' + option.substr(1);
            }

            return this.request(method.toUpperCase(), path, data, headers, callback);
        };
    });

    return PostRest;

})();