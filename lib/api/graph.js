/*global exports, require */

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

exports.graph = function(db) {
    "use strict";

    var path = "/_graph/";

    var graph_document = require('./document').document(db, '_graph');

    return {
        "create": function(name) {

            var graph = {
                name: name
            };

            return db.post(path + 'graph', graph);
        },
        "delete": function(name, options) {

            var cascade = options && options.cascade === true ? '/cascade' : '';

            return db.delete(path + 'graph/' + name + cascade);
        },
        "adjacent": function(id, label, graph) {

            if (!graph) {
                graph = label;
                label = '';
            }

            if (label) label = '/' + label;

            return db.get(path + 'adjacent/' + graph + '/' + id + label);
        },
        "traverse": function(from, to, label, graph) {

            if (!graph) {
                graph = label;
                label = '';
            }

            if (label) label = '/' + label;

            return db.get(path + 'traverse/' + graph + '/' + from + '/' + to + label);
        },
        "edge": {
            "create": function(from, to, label, graph) {
                var data = {};
                
                if(!Array.isArray(from) && typeof from === 'object'){
                    graph = label;
                    label = to;
                    data.from = from.from;
                    data.to = from.to;
                } else {
                    data.from = from;
                    data.to = to;
                }
               
                if (!graph) {
                    graph = label;
                    label = undefined;
                }

                if (label) data.label = label;

                return db.post(path + 'edge/' + graph, data);
            },
            "node": function(label, direction, graph) {
                if(graph == undefined){
                    graph = direction;
                    direction = undefined;
                }
                
                direction = direction || 'to';
                
                return db.get(path + 'node/' + graph + '/' + label + '/' + direction);
            },
            "delete": function(from, to, label, graph) {
                var data = {};
                
                if(!Array.isArray(from) && typeof from === 'object'){
                    graph = label;
                    label = to;
                    data.from = from.from;
                    data.to = from.to;
                } else {
                    data.from = from;
                    data.to = to;
                }
                
                if (!graph) {
                    graph = label;
                    label = undefined;
                }

                if (label) data.label = label;

                return db.delete(path + 'edge/' + graph, data);
            }
        },
        "node": graph_document
    };
};
