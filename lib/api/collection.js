exports.collection = function (db) {
    "use strict";

    var path = "/_collection/";

    return {
        "create": function (collection, options) {
            collection = collection || db._collection;
            options = options || {};

            return db.post(path + collection, options);
        },
        "delete": function (collection) {
            collection = collection || db._collection;

            return db.delete(path + collection);
        }
    };

};