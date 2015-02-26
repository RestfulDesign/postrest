var postrest;

try {
    postrest = PostRest
} catch(e) {
    postrest = require('..')
}

describe("-database", function () {

    var db;

    before(function (done) {
        db = postrest('http://kaerus:kaerus@127.0.0.1:8080');

        db.database.delete("test",function() {
            db.database.create("test").callback(done);
        });
    });

    describe("stats", function () {

        it('list', function (done) {
            db.database.list()
				.then(function(ret){
					ret.json.should.include('test');
				}).catch(done);
        })

    });



});