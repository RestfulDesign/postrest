var postrest;

try {
    postrest = PostRest
} catch(e) {
    postrest = require('..')
}

describe("module:database", function () {

    var db = postrest('http://kaerus:kaerus@127.0.0.1:8080');

    before(function (done) {

        db.database.delete('my_test_database_1')
            .finally(function () {

                db.database.delete('my_test_database_2')
                    .finally(function () {

                        db.database.delete('my_test_database_3')
                            .finally(function () {

                                done();
                            });
                    });
            });
    });

    describe("create", function () {

        it('my_test_database_1', function (done) {
            db.database.create('my_test_database_1')
                .then(function (ret) {
                    done();
                }).catch(done);
        })

        it('my_test_database_2', function (done) {
            db.database.create('my_test_database_2')
                .then(function (ret) {
                    done();
                }).catch(done);
        })


        it('my_test_database_3', function (done) {
            db.database.create('my_test_database_3')
                .then(function (ret) {
                    done();
                }).catch(done);
        })


        it('list', function (done) {
            db.database.list()
                .then(function (ret) {
                    ret.result.should.containDeep([
                        'my_test_database_1',
                        'my_test_database_2',
                        'my_test_database_3'
                    ]);
                    done();
                }).catch(done);
        })


        if('create and delete', function (done) {
                db.database.create('delete_me')
                    .then(function () {
                        return db.database.delete('delete_me')
                            .then(function () {;
                                done();
                            });
                    }).catch(done);
            });

    });



});