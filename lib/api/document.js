
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

    return {
        "get": function (id, collection) {
            collection = collection || db._collection;

            return db.get(path + collection + '/' + id);
        },
        "find": function (document, collection) {
            collection = collection || db._collection;

            return db.post(path + 'find/' + collection, document);
        },
        "create": function (document, collection) {
            collection = collection || db._collection;

            return db.post(path + 'create/' + collection, document);
        },
        "update": function (id, document, collection) {
            collection = collection || db._collection;

            return db.put(path + collection + '/' + id, document);
        },
        "delete": function (id, collection) {
            collection = collection || db._collection;

            return db.delete(path + collection + '/' + id);
        }
    }
};