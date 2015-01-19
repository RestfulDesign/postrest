/*global module setImmediate */

module.exports = (function () {
    "use strict";

    // singleton task handler
    function Task(func, args, context, errback) {
        Task.push(func, args, context, errback);
    }

    Task.first = 0;
    Task.last = 0;
    Task.queue = null;
    Task.init = 32;
    Task.push = head;
    Task.unwind = true;
    Task.cancel = false;
    Task.defer = setImmediate; // use setImmediate shim on browsers
    Task.exec = function (func, args, context, errback) {
        try {
            func.apply(context, args);
        } catch(error) {
            if(typeof errback === 'function') {
                errback(error);
            } else {
                Task.defer(function () {
                    throw error;
                });
            }
        }
    };

    Task.belay = function () {
        Task.push = tail;
    };

    function head(func, args, context, errback) {
        Task.queue = Array(Task.init);
        Task.first = 0;
        Task.last = 0;

        Task.queue[Task.last++] = [func, args, context, errback];
        Task.push = tail;
        Task.defer(drain);
    }

    function tail(func, args, context, errback) {
        Task.queue[Task.last++] = [func, args, context, errback];
    }

    function drain() {
        var i = Task.first,
            l = Task.last,
            q;

        while(i < l) {
            if(Task.cancel) {
                Task.cancel = false;
                Task.push = head;
                return;
            }

            q = Task.queue[i++];
            Task.exec.apply(null, q);
        }

        if(Task.last > l) {
            Task.first = l;
            if(Task.unwind) drain();
            else Task.defer(drain);
        } else {
            Task.push = head;
        }

    }

    return Task;

})();