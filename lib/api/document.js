exports.document = function (db) {
    "use strict";

    var path = "/_document/";

    return {
        "get": function (id, collection) {
            collection = collection || db._collection;

            return db.get(path + collection + '/' + id);
        },
        "find": function (document, collection) {
            collection = collection || db._collection;

            return db.post(path + 'find/' + collection, document);
        },
        "create": function (document, collection) {
            collection = collection || db._collection;

            return db.post(path + 'create/' + collection, document);
        },
        "update": function (id, document, collection) {
            collection = collection || db._collection;

            return db.put(path + collection + '/' + id, document);
        },
        "delete": function (id, collection) {
            collection = collection || db._collection;

            return db.delete(path + collection + '/' + id);
        }
    }
};