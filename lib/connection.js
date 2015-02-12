/*global require module */

module.exports = (function () {
    "use strict";

    var utils = require('./utils');

    function Connection(url) {
        var conn = utils.url.parse(url);

        if(conn) {
            utils.extend(true, this, conn);
        }

        this.headers = {};

        if(this.path) {
            if(this.path.base) {
                this.headers['x-database'] = this.path.base;
            }

            if(this.path.hash) {
                this.headers['x-schema'] = this.path.hash;
            }
        }

        if(this.host && this.host.username) {
            this.headers['authorization'] = 'Basic ' +
                utils.base64.encode(this.host.username + ':' + (this.host.password || ""));
        }

        this.encoding = 'utf8';
    }

    return Connection;

})();