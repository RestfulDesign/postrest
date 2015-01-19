/*global module */
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