/*global require module */

module.exports = (function () {
    "use strict";

    var utils = require('./utils');

    function Connection(url) {
        var conn = utils.url.parse(url);

        if(conn) {
            utils.extend(true, this, conn);
        }

        this.status = {
            connected: false
        };

        this.headers = {

        };

        if(this.username) {
            this.headers['authorization'] = 'Basic ' +
                utils.base64.encode(this.username + ':' + (this.password || ""));
        }

        // wipe out the password
        delete this.password;

        this.database = this.path.base || this.username || 'default';
        this.schema = this.path.hash || 'public';
        this.encoding = 'utf8';

        this.connect();
    }

    Connection.prototype = {
        connect: function () {},
        disconnect: function () {}
    };


    return Connection;

})();