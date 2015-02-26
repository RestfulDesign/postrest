/*global require module setTimeout clearTimeout*/

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

    var task = require('./task');

    var slice = Array.prototype.slice,
        isArray = Array.isArray;

    var PENDING = 0,
        FULFILLED = 1,
        REJECTED = 2;

    function Promise(p) {
        var self = this;

        // object mixin
        if(p && typeof p === 'object') {
            for(var k in Promise.prototype)
                p[k] = Promise.prototype[k];
            p._promise = {
                _chain: []
            };

            return p;
        }

        // create new instance
        if(!(this instanceof Promise))
            return new Promise(p);

        this._promise = {
            _chain: []
        };

        // resolver callback
        if(typeof p === 'function') {
            task(function () {
                var res = self.resolve.bind(self),
                    rej = self.reject.bind(self),
                    pro = self.progress.bind(self),
                    tim = self.timeout.bind(self);

                p(res, rej, pro, tim);
            });
        }
    }

    Promise.thenable = function (p) {
        var then;

        if(p && (typeof p === 'object' || typeof p === 'function')) {
            try {
                then = p.then;
            } catch(e) {
                return false;
            };
        }

        return(typeof then === 'function');
    };

    Promise.defer = function () {
        var args = slice.call(arguments),
            f = args.shift(),
            p = new Promise();

        if(typeof f === 'function') {
            task(enclose, args);
        }

        function enclose() {
            try {
                p.resolve(f.apply(p, args));
            } catch(err) {
                p.reject(err);
            }
        }

        return p;
    };

    Promise.async = function (func, cb) {
        var p = new Promise(),
            called;

        if(typeof func !== 'function')
            throw new TypeError("func is not a function");

        cb = typeof cb === 'function' ? cb : function (err, ret) {
            called = true;

            if(err) p.reject(err);
            else if(err === 0) p.progress(ret);
            else p.fulfill(ret);
        };

        return function () {
            var args = slice.call(arguments);

            args.push(cb);

            task(function () {
                var ret;

                try {
                    ret = func.apply(null, args);
                } catch(err) {
                    cb(err);
                }

                if(ret !== undefined && !called) {
                    if(ret instanceof Error) cb(ret);
                    else cb(undefined, ret);
                }
            });

            return p;
        };
    };

    Promise.prototype.isPending = function () {
        return !this._promise._state;
    };

    Promise.prototype.isFulfilled = function () {
        return this._promise._state === FULFILLED;
    };

    Promise.prototype.isRejected = function () {
        return this._promise._state === REJECTED;
    };

    Promise.prototype.hasResolved = function () {
        return !!this._promise._state;
    };

    Promise.prototype.valueOf = function () {
        return this.isFulfilled() ? this._promise._value : undefined;
    };

    Promise.prototype.reason = function () {
        return this.isRejected() ? this._promise._value : undefined;
    };

    Promise.prototype.then = function (f, r, n) {
        var p = new Promise();

        this._promise._chain.push([p, f, r, n]);

        if(this._promise._state) task(traverse, [this._promise]);

        return p;
    };

    Promise.prototype.spread = function (f, r, n) {
        function s(v, a) {
            if(!isArray(v)) v = [v];
            return f.apply(f, v.concat(a));
        }

        return this.then(s, r, n);
    };

    Promise.prototype.done = function (f, r, n) {
        var self = this,
            p = this.then(f, catchError, n);

        function catchError(e) {
            task(function () {
                if(typeof r === 'function') r(e);
                else if(typeof self.onerror === 'function') {
                    self.onerror(e);
                } else if(Promise.onerror === 'function') {
                    Promise.onerror(e);
                } else throw e;
            });
        }
    };

    Promise.prototype.end = function (callback) {

        this.then(callback, function (e) {

            if(!(e instanceof Error)) {
                e = new Error(e);
            }

            if(typeof callback === 'function') callback(e);
            else throw e;
        });

    };

    Promise.prototype.catch = function (errBack) {
        this.done(undefined, errBack);
    };

    Promise.prototype.fulfill = function (value, opaque) {

        if(!this._promise._state) {
            this._promise._state = FULFILLED;
            this._promise._value = value;
            this._promise._opaque = opaque;

            task(traverse, [this._promise]);
        }

        return this;
    };

    Promise.prototype.reject = function (reason, opaque) {

        if(!this._promise._state) {
            this._promise._state = REJECTED;
            this._promise._value = reason;
            this._promise._opaque = opaque;

            task(traverse, [this._promise]);
        }

        return this;
    };

    Promise.prototype.resolve = function (x, o) {
        var then, z, p = this;

        if(!this._promise._state) {
            if(x === p) p.reject(new TypeError("Promise cannot resolve itself!"));

            if(x && (typeof x === 'object' || typeof x === 'function')) {
                try {
                    then = x.then;
                } catch(e) {
                    p.reject(e);
                }
            }

            if(typeof then !== 'function') {
                this.fulfill(x, o);
            } else if(!z) {
                try {
                    then.apply(x, [function (y) {
                        if(!z) {
                            p.resolve(y, o);
                            z = true;
                        }
                    }, function (r) {
                        if(!z) {
                            p.reject(r);
                            z = true;
                        }
                    }]);
                } catch(e) {
                    if(!z) {
                        p.reject(e);
                        z = true;
                    }
                }
            }
        }

        return this;
    };

    Promise.prototype.progress = function () {
        var notify, chain = this._promise._chain;

        for(var i = 0, l = chain.length; i < l; i++) {
            if(typeof (notify = chain[i][2]) === 'function')
                notify.apply(this, arguments);
        }
    };

    Promise.prototype.timeout = function (msec, func) {
        var p = this;

        if(msec === null) {
            if(this._promise._timeout)
                clearTimeout(this._promise._timeout);

            this._promise._timeout = null;
        } else if(!this._promise._timeout) {
            this._promise._timeout = setTimeout(onTimeout, msec);
        }

        function onTimeout() {
            var e = new RangeError("exceeded timeout");
            if(!this._promise._state) {
                if(typeof func === 'function') func(p);
                else if(typeof p.onerror === 'function') p.onerror(e);
                else throw e;
            }
        }

        return this;
    };

    Promise.prototype.callback = function (callback) {
        return this.then(function (value, opaque) {
            return callback(undefined, value, opaque);
        }, function (reason, opaque) {
            var error = reason;

            if(!(error instanceof Error)) {
                if(typeof reason === 'object') {
                    error = new Error(JSON.stringify(reason));
                    for(var k in reason)
                        error[k] = reason[k];
                } else {
                    error = new Error(reason);
                }
            }

            return callback(error, opaque);
        }, function (progress) {
            return callback(0, progress);
        });
    };

    Promise.prototype.join = function (j) {
        var p = this,
            y = [],
            u = new Promise().resolve(p).then(function (v) {
                y[0] = v;
            });

        if(arguments.length > 1) {
            j = slice.call(arguments);
        }

        if(!isArray(j)) j = [j];

        function stop(error) {
            u.reject(error);
        }

        function collect(i) {
            j[i].then(function (v) {
                y[i + 1] = v;
            }).catch(stop);

            return function () {
                return j[i];
            };
        }

        for(var i = 0; i < j.length; i++) {
            u = u.then(collect(i));
        }

        return u.then(function () {
            return y;
        });
    };

    // yields a promised value to handlers
    function traverse(_promise) {
        var l, tuple = _promise._chain;

        if(!tuple.length) return;

        var t, p, h, v = _promise._value;

        while((t = tuple.shift())) {
            p = t[0];
            h = t[_promise._state];

            if(typeof h === 'function') {
                try {
                    v = h(_promise._value, _promise._opaque);
                    p.resolve(v, _promise._opaque);
                } catch(e) {
                    p.reject(e);
                }
            } else {
                p._promise._state = _promise._state;
                p._promise._value = v;
                p._promise._opaque = _promise._opaque;

                task(traverse, [p._promise]);
            }
        }
    }

    return Promise;
})();