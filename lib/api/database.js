exports.database = function (db) {
    "use strict";

    var path = "/_database/";

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
        },
        "active": function () {
            return db.get(path + 'active');
        },
        "idle": function () {
            return db.get(path + 'idle');
        },
        "version": function () {
            return db.get(path + 'version');
        }
    }
};