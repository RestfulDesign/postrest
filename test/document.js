var postrest;

var csvParse = require('csv-parse');
var fs = require('fs');

try {
    postrest = PostRest
} catch(e) {
    postrest = require('..')
}

describe("-document", function () {

    var db, data = [];

    before(function (done) {
        db = postrest('http://kaerus:kaerus@127.0.0.1:8080');

        db.database.delete("document").finally(function () {

            db.database.create("document").finally(function () {

                db = db.use('/document:data');
                console.log("connecting to %s", db.connection.toString());

                db.collection.delete('data')
                    .then(function (err, ret) {
                        console.log("create collection data");
                        db.collection.create('data')
                            .then(function () {

                                console.log("created data collection");

                                var promise = new db.Promise();
                                var documents = [];

                                for(var i = 0; i < 10000; i++) {
                                    var o = {};
                                    o['name'] = '' + i;
                                    o['value'] = i;
                                    o['tags'] = [];
                                    o['prop'] = {
                                        x: 1,
                                        y: 2
                                    };

                                    if(i % 1) o.tags.push('odd');
                                    if(i % 2) o.tags.push('even');
                                    if(i % 10) o.tags.push('ten');
                                    if(i % 50) o.tags.push('fifty');
                                    if(i % 100) o.tags.push('hundred');
                                    if(i % 1000) o.tags.push('thousand');

                                    var dc = db.document.create(o, 'data')
                                        .then(function (doc) {
                                            data.push(doc);
                                        });
                                    all.push(dc);
                                }

                                promise.all(documents).then(function () {
                                    done();
                                }).catch(done);
                            });
                    });
            });
        });

    });

    describe("create", function () {

        it('get first document', function (done) {
            db.document.get(data[0].id, 'data')
                .then(function (ret) {
                    ret.result[0].id.should.equal(data[0].id);
                    done();
                }).catch(done);
        })
    });



});