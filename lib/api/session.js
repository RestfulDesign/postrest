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

exports.session = function (db) {
    "use strict";

    var path = "/_session";

    return {
        "login": function (options) {
            options = options || {};

            var host = db.connection.host || {};

            if(!options.database) options.database = db._database || "postgres";
            if(!options.schema) options.schema = db._schema ||  "public";
            if(!options.username) options.username = host.username ||  "";
            if(!options.password) options.password = host.password || "";

            return(db.post(path, options).then(function (res) {
                db.connection.headers['authorization'] = res.authorization;
                db.connection.path.base = options.database;
                db.connection.path.hash = options.schema;
                return res;
            }));
        },
        "logout": function () {
            return db.delete(path);
        }
    }
};