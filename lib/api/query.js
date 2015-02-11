/*global exports */

function QueryAPI(db) {

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
    
    sql.get = function(query){
        return db.get(path + query)
    };
    
    return sql;
}

exports.sql = QueryAPI;