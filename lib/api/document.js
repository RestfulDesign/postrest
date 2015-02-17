exports.document = function (db) {
    "use strict";

    var path = "/_doc/";

    return {
        "get": function (id, collection) {
            collection = collection || db.collection;

            return db.get(path + id + '&-collection=' + collection);
        },
        "find": function (document, collection) {
            collection = collectionb || db.collection;

            return db.post(path + 'find' + '&-collection=' + collection, document);
        },
        "create": function (document, collection) {
            collection = collection || db.collection;

            return db.post(path + '&-collection=' + collection, document);
        },
        "update": function (id, document, collection) {
            collection = collection || db.collection;

            var data = {
                document: document,
                collection: collection
            };
            return db.put(path + 'update/' + id, data);
        },
        "delete": function (id, collection) {
            collection = collection || db.collection;

            return db.delete(path + id + '&-collection=' + collection);
        },
        "collection": {
            "create": function (collection, options) {
                collection = collection || db.collection;

                var data = {
                    collection: collection
                };

                if(options && options.index) data.index = options.index;

                return db.post(path + 'collection', data);
            },
            "delete": function (collection) {
                return db.delete(path + 'collection' + '&-collection=' + collection);
            }
        },
        "index": {
            "create": function (field, collection) {

                var data = {
                    field: field,
                    collection: collection
                };

                return db.post(path + 'index', data);
            },
            "delete": function (field, collection) {
                collection = collection || db.collection;

                return db.delete(path + 'index' + '&-field=' + field + '&-collection=' + collection);
            }
        }
    }
};