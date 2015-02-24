var postrest;

try {
    postrest = PostRest
} catch(e) {
    postrest = require('..')
}

describe("database", function () {

    var db;

    before(function (done) {
        db = postrest('http://kaerus:kaerus@127.0.0.1:8080');

        db.database.create("test")
            .end(function () {
                done();
            });
    });

    describe("delete & create", function () {

        it('delete [test] database', function (done) {
            db.database.delete('test')
                .callback(done);
        })

        it('create [test] database', function (done) {
            db.database.create('test')
                .callback(done);
        })
    });



});