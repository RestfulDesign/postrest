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

        var reset = [];
        db.database.delete("document", {
            shutdown: true
        }).finally(function () {
            db.database.create("document").then(function () {
                db = db.use("/document");
                db.collection.create('data').then(function () {
                    var documents = [];
                    db = db.use(':data');

                    console.log("use:", db.connection.toString());

                    for(var i = 0; i < 1000; i++) {
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
                        documents.push(dc);
                    }

                    db.Promise.all(documents).then(function () {
                        done();
                    }).catch(done);
                }).catch(done);
            }).catch(done);
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