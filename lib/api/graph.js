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

exports.graph = function (db) {
    "use strict";

    var path = "/_graph/";

    return {
        "create": function (name) {
            var graph = {
                name: name
            };

            return db.post(path + 'create', graph);
        },
        "delete": function (name, options) {
            var cascade = options && options.cascade === true ? '/cascade' : '';

            return db.delete(path + 'delete/' + name + cascade);
        },
        "node": function (id,graph) {
            return db.get(path + 'node/' + graph + '/' + id);
        },
        "adjacent": function (id,graph) {
            return db.get(path + 'adjacent/' + graph + '/' + id);
        },
        "byname": function (name,graph) {
            return db.get(path + 'byname/' + graph + '/' + name);
        },
        "bylabel": function (name,graph) {
            return db.get(path + 'bylabel/' + graph + '/' + name);
        },
        "byprop": function (prop,graph) {
            return db.post(path + 'byprop/' + graph, prop);
        }
    }
};