/*global require module */

/* 
 * Copyright (c) 2015 RestfulDesign (restfuldesign.com),
 * created by Anders Elo <anders @ restfuldesign com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = (function () {
    "use strict";

    var utils = require('./utils');

    function Connection(conn) {
        conn = utils.url.parse(conn);

        utils.extend(true, this, conn);

        this.toString = conn.toString;

        if(!this.path) this.path = {};

        this.headers = {};

        this.headers['accept'] = 'application/json';

        this.encoding = 'utf8';
    }

    return Connection;

})();