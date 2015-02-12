/*global exports */

function SQLAPI(db) {
    "use strict";

    var squel = require('squel').useFlavour('postgres');
    var utils = require('../utils');

    var path = "/_query/";

    function sql(query, options) {
        var data = {
            type: "sql",
            query: query
        };

        if(options) {
            if(options.gucs) data.gucs = options.gucs;
        }

        return db.post(path, data);
    }

    sql.get = function (query) {
        return db.get(path + query)
    };

    squel.cls.QueryBuilder.prototype.exec = function () {
        return sql(this.toString());
    };

    utils.extend(true, sql, squel);

    return sql;
}

exports.sql = SQLAPI;