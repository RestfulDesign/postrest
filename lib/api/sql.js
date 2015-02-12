/*global exports */

function SQLAPI(db) {
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
            if(options.params) data.fields = options.params;
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
}

exports.sql = SQLAPI;