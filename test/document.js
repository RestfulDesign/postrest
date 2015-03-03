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

                    ret.type.should.eql('array');
                    ret.items.should.eql(1);
                    retval = ret.result[0];
                    done();
                }).catch(done);
        });

        it('get()', function (done) {
            db.document.get(retval.id)
                .then(function (ret) {
                    var doc = ret.result[0];
                    doc.id.should.eql(retval.id);
                    doc.rev.should.eql(retval.rev);
                    doc.document.should.eql(doc1);
                    done();
                }).catch(done);
        });


    });



});