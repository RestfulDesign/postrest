
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
 
exports.sql = function (db) {
    "use strict";

    var squel = require('squel').useFlavour('postgres');
    var utils = require('../utils');

    var path = "/_query/";

    function sql(query, options) {
        var data = {
            type: "sql",
            query: query.toString()
        };

        if(options && typeof options === 'object') {
            if(options.params) data.params = options.params;
            if(options.gucs) data.gucs = options.gucs;
        }

        return db.post(path, data);
    }

    sql.get = function (query) {
        return db.get(path + query)
    };

    squel.cls.QueryBuilder.prototype.exec = function (options) {
        return sql(this, options);
    };

    utils.extend(true, sql, squel);

    return sql;
};