/*global module */

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

    function extend() {
        var source,
            target,
            deep = false,
            args = Array.prototype.slice.call(arguments),
            argc = args.length,
            arg = 0;

        if(typeof args[0] === "boolean") deep = args[arg++];

        target = args[arg++];

        if(argc <= arg) return extend(deep, {}, target);

        while(arg < argc) {
            source = args[arg++];

            Object.keys(source).forEach(function (key) {
                var from = source[key],
                    to = target[key];

                if(deep && isObject(from)) {
                    if(target.hasOwnProperty(key) && isObject(to)) {
                        extend(true, target[key], from);
                    } else {
                        target[key] = extend(true, {}, from);
                    }
                } else if(from !== undefined) {
                    target[key] = from;
                }
            });
        }

        return target;
    }

    function isObject(o) {
        return typeof o === 'object' && o !== null && !Array.isArray(o);
    }

    return extend;
}());