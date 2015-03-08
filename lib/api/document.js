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

exports.document = function (db) {
    "use strict";

    var path = "/_document/";

    var _limit = 0;
    var _offset = 0;

    function limited(options) {
        if(typeof options !== 'object') return '';

        var l = options.limit !== undefined ? parseInt(limit, 10) :  _limit;
        var o = options.offset !== undefined ? parseInt(offset, 10) :  _offset;

        return l || o ? '/' + l + '/' + o : '';
    }

    return {
        "get": function (id, options) {
            options = options || {};
            var collection = options.collection || db._collection;

            return db.get(path + 'byid/' + collection + '/' + id);
        },
        "list": function (options) {
            options = options || {};
            var collection = options.collection || db._collection;

            return db.get(path + 'list/' + collection + limited(options));
        },
        "all": function (options) {
            options = options || {};
            var collection = options.collection || db._collection;

            return db.get(path + 'all/' + collection + limited(options));
        },
        "find": function (document, options) {
            options = options || {};
            var collection = options.collection || db._collection;

            return db.post(path + 'find/' + collection + limited(options), document);
        },
        "create": function (document, options) {
            options = options || {};
            var collection = options.collection || db._collection;

            return db.post(path + 'create/' + collection, document);
        },
        "update": function (id, document, options) {
            options = options || {};
            var collection = options.collection || db._collection;

            return db.put(path + collection + '/' + id, document);
        },
        "delete": function (id, options) {
            options = options || {};
            var collection = options.collection || db._collection;

            return db.delete(path + collection + '/' + id);
        },
        "limit": function (limit) {
            _limit = parseInt(limit, 10);
            return this;
        },
        "offset": function (offset) {
            _offset = parseInt(offset, 10);
            return this;
        }
    }
};