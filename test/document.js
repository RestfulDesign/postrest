var postrest;

var csvParse = require('csv-parse');
var fs = require('fs');

try {
    postrest = PostRest
} catch(e) {
    postrest = require('..')
}

describe("module:document", function () {

    var db = postrest('http://kaerus:kaerus@127.0.0.1:8080');
    var data = [];

    before(function (done) {
        db.database.delete('documents')
            .finally(function () {
                db.database.create('documents')
                    .finally(function () {
                        db.use('/documents').collection.create('store')
                            .finally(function (documents) {
                                db = db.use('/documents:store');
                                done();
                            });
                    });
            });
    });

    describe("methods", function () {
        var retval;

        var doc1 = {
            a: 1,
            b: 2,
            c: {
                d: 3
            }
        };


        it('create()', function (done) {

            db.document.create(doc1)
                .then(function (ret) {
                    ret.should.have.property('result');
                    ret.result.should.have.property('id'); // uuid
                    ret.result.should.have.property('rev'); // revision
                    ret.should.have.property('items', 1); // result items
                    retval = ret.result;
                    done();
                }).catch(done);
        });

        it('get()', function (done) {
            db.document.get(retval.id)
                .then(function (ret) {
                    ret.should.have.property('items', 1);
                    ret.should.have.property('result');
                    var res = ret.result;
                    res.should.be.an.Object.and.not.an.Array;
                    res.should.have.property('id', retval.id);
                    res.should.have.property('rev', retval.rev);
                    res.should.have.property('doc', doc1);

                    done();
                }).catch(done);
        });


    });



});