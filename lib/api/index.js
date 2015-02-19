exports.index = function (db) {
    "use strict";

    var path = "/_index/";

    return {
        "create": function (field, collection) {
            collection = collection || db._collection;

            var data = {
                field: field
            };

            return db.post(path + collection, data);
        },
        "delete": function (field, collection) {
            collection = collection || db._collection;

            return db.delete(path + collection + '/' + field);
        }
    };

};