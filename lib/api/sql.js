/*global exports */

function SqlAPI(db) {

    var path = "";

    return function (query, options) {
        var data = {
            type: "sql",
            query: query
        };

        if(options) {
            if(options.gucs) data.gucs = options.gucs;
        }

        return db.post(path, data);
    };
}

exports.sql = SqlAPI;