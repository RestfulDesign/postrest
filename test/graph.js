var csvParse = require('csv-parse');
var fs = require('fs');

try {
    postrest = PostRest
} catch(e) {
    postrest = require('..')
}

describe("module:graph", function () {

    var db = postrest('http://kaerus:kaerus@127.0.0.1:8080');
    var data = [];

    before(function (done) {
        db.database.delete('graphs')
            .finally(function () {
                db.database.create('graphs')
                    .finally(function () {
                        db = db.use('/graphs');
                        done();
                    });
            });
    });

    describe("create & delete", function () {

        it('create()', function (done) {
            db.graph.create('test')
                .then(function (ret) {
                    done();
                }).catch(done);
        });

        it('delete()', function (done) {
            db.graph.delete('test')
                .then(function (ret) {
                    done();
                }).catch(done);
        });

    });



});