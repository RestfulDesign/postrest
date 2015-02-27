/*global module setImmediate */

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
				throw error;
            }
        }
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