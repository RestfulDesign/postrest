
exports.database = function(db) {
    "use strict";

    var path = "/_db/";

    return {
        "list": function () {
            return db.get(path + 'list');
        },
        "tables": function () {
            return db.get(path + 'tables');
        },
        "stats": function () {
            return db.get(path + 'stats');
        },
        "users": function () {
            return db.get(path + 'users');
        },
        "grants": function () {
            return db.get(path + 'grants');
        }
    }
};
