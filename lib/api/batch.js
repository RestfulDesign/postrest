/*global require exports */

exports.batch = function (db) {
    var utils = require('../utils');

    var batchPart = 'content-type: application/json',
        defaultBoundary = 'postrest-batch-{id}',
        request = db.request,
        sequence = 0,
        boundary,
        jobs = [];

    var path = "/_batch/";


    function batchError(e) {
        this.name = 'batch_error';

        if(utils.isObject(e)) {
            this.code = e.code;
            this.status = e.status;
            this.message = e.message;
        } else {
            e.message = e.toString();
        }
    }

    batchError.prototype = Object.create(Error.prototype);
    batchError.prototype.constructor = batchError;

    function promisedJobs(j) {
        return j.map(function (arg) {
            return arg[0];
        });
    }

    return {

        "start": function (user_boundary) {
            ++sequence;

            boundary = user_boundary ? user_boundary + sequence : defaultBoundary.replace(/{(.*)}/, sequence);

            /* start capturing requests */
            db.request = function () {
                var args = Array.prototype.slice.call(arguments),
                    job = new db.Promise.defer();

                args.unshift(job);
                jobs.push(args);

                return job;
            };

            return db;
        },

        "exec": function () {
            var data = '',
                args, batchJobs, i;

            var headers = {
                'content-type': "multipart/form-data; boundary=" + boundary
            };

            if(!jobs.length) throw new batchError("No jobs");

            for(i = 0; i < jobs.length; i++) {
                args = jobs[i];

                data += '--' + boundary + '\r\n';
                data += batchPart + '\r\n\r\n';
                data += args[1] + ' ' + args[2] + " HTTP/1.1\r\n\r\n";

                if(args[3]) {
                    if(typeof args[3] === 'string') data += args[3];
                    else data += JSON.stringify(args[3]);
                    data += '\r\n';
                }

                if(args[4]) {
                    utils.extend(true, headers, args[4]);
                }

            }

            data += '--' + boundary + '--\r\n';

            batchJobs = promisedJobs(jobs);

            jobs = [];

            db.request = request;
            // note: joins result of batch operation and individual jobs
            return db.post(path, data, headers).then(function (data, xhr) {
                var ret, job;

                // collects batch results
                var results = decode_multipart(data, boundary);

                // settles all promised jobs
                for(var j = 0; j < batchJobs.length; j++) {
                    ret = results[j];
                    job = batchJobs[j];

                    if(ret && ret.status < 400) {
                        batchJobs[j].resolve(ret);
                    } else {
                        batchJobs[j].reject(ret);
                    }
                }

                return db.Promise.all(batchJobs);
            }, function (error) {

                error = new batchError(error);

                for(var job in batchJobs) {
                    batchJobs[job].reject(error);
                }

                throw error;
            });
        },

        "cancel": function (reason) {
            var batchJobs = promisedJobs(jobs),
                error = new batchError(reason);

            db.request = request;

            for(var job in batchJobs) {
                batchJobs[job].reject(error);
            }

            return db;
        }
    };
}

function decode_multipart(message, boundary) {
    var results = [];

    // split message into chunks
    var chunks = message.split('--' + boundary).filter(function (f) {
        return f;
    }).map(function (m) {
        return m.split('\r\n');
    });

    chunks.forEach(function (part) {
        var status, result;
        var lines = [],
            segments = [];

        // check for valid batchPart in chunk
        var i = part.indexOf(batchPart);

        // not a batch part
        if(i < 0) return;

        for(var j = i + 1; j < part.length; j++) {
            // collect lines to segments
            if(!part[j]) {
                if(lines.length) segments.push(lines);
                lines = [];
            } else {
                lines.push(part[j]);
            }
        }

        if(segments.length) {
            // get http status code
            status = parseInt(segments[0][0].split(' ')[1], 10);

            try {
                result = JSON.parse(segments[1]);
            } catch(e) {
                result = segments[1];
            }

            // note: results matches the batch job order.
            results.push({
                status: status,
                headers: segments[0],
                result: result
            });
        }
    });

    return results;
}