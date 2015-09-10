/*global exports */

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

exports.document = function (db, suffix) {
    "use strict";

    var path = "/_document/";

    var _limit = 0;
    var _offset = 0;

    // collection name suffix
    suffix = suffix || '_document';

    function limited(options) {
        if(typeof options !== 'object') return '';

        var l = options.limit !== undefined ? parseInt(options.limit, 10) : _limit;
        var o = options.offset !== undefined ? parseInt(options.offset, 10) : _offset;

        return l || o ? '/' + l + '/' + o : '';
    }

    return {
        "get": function (id, collection) {
            collection = collection || db._collection;

            return db.get(path + 'byid/' + collection + suffix + '/' + id);
        },
        "list": function (collection, options) {
            collection = collection || db._collection;

            return db.get(path + 'list/' + collection + suffix + limited(options));
        },
        "all": function (collection, options) {
            collection = collection || db._collection;

            return db.get(path + 'all/' + collection + suffix + limited(options));
        },
        "find": function (document, collection, options) {
            if(typeof collection === 'object') {
                options = collection;
                collection = undefined;
            }

            collection = collection || db._collection;

            return db.post(path + 'find/' + collection + suffix + limited(options), document);
        },
	"findByName": function(name,collection){
	    collection = collection || db._collection;

	    return db.get(path + 'byname/' + collection + suffix + '/' + encodeURIComponent(name));
	},
        "create": function (name, document, collection) {
            if(typeof name === 'object') {
                collection = document;
                document = name;
                name = undefined;
            }

            collection = collection || db._collection;

            var data = {};

            if(Array.isArray(document)) {
                data.documents = document;
            } else {
                data.document = document;

                if(name) data.name = name;
            }

            return db.post(path + 'create/' + collection + suffix, data);
        },
        "update": function (id, name, document, collection) {
            if(typeof name === 'object') {
                collection = document;
                document = name;
                name = undefined;
            }

            collection = collection || db._collection;

            var data = {
                document: document
            };

            if(name) data.name = name;

            return db.put(path + collection + suffix + '/' + id, data);
        },
        "delete": function (id, collection) {
            collection = collection || db._collection;

            return db.delete(path + collection + suffix + '/' + id);
        },
        "limit": function (limit) {
            _limit = parseInt(limit, 10);
            return this;
        },
        "offset": function (offset) {
            _offset = parseInt(offset, 10);
            return this;
        }
    };
};
