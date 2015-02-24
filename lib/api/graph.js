exports.graph = function (db) {
    "use strict";

    var path = "/_graph/";

    return {
        "create": function (name, options) {
            options = options || {};

            db.post(path + name, options);
        },
        "list": function () {
            return db.get(path + 'list');
        }
    }
};