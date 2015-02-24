var postrest;

var csvParse = require('csv-parse');

try {
    postrest = PostRest
} catch(e) {
    postrest = require('..')
}

describe("document", function () {

    var db, opendata;

    before(function (done) {
        db = postrest('http://kaerus:kaerus@127.0.0.1:8080');
        var odata = postrest('http://www.opengeocode.org');

        db.database.delete("document").end(function () {
            console.log("dropping document");
            db.database.create("document").end(function () {

                db.connection.path.base = 'document';
                console.log("creating books collection");

                db.collection.create('books')
                    .then(function () {
                        return odata.get('/opendata/opendata.csv');
                    }).then(function (csv) {
                        console.log("got data");
                        return loadData(csv);
                    }).callback(done);
            });
        });

        function loadData(csv) {
            csvParse.parse(csv, {
                columns: true
            }, function (err, ret) {
                if(err) return err;

                opendata = ret;
                console.log("loaded %d rows", ret.length);
            });
        }
    });

    describe("create", function () {

        it('create one', function (done) {
            db.document.create({
                name: ""
            })
        })

        it('create [test] database', function (done) {
            db.database.create('test')
                .callback(done);
        })
    });



});