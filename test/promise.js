var uP = require('../lib/utils/promise');


describe("Constructor", function () {
    it("should create a Promise", function (done) {
        uP.should.be.a.Function;

        var p = new uP();
        p.then.should.be.a.Function;

        p.then(function (ok) {
            ok.should.equal(123);
            done();
        }, done);

        p.fulfill(123);
    });

    it("should be able to mixin", function (done) {
        function myClass(x) {
            uP(this); // mixing to myClass
            this.x = x;
        };

        var my = new myClass(123);

        my.should.have.ownProperty('x');
        my.x.should.equal(123);

        uP.thenable(my).should.equal(true);

        my.then(function (ok) {
            ok.should.equal(321);
        }).callback(done);

        my.fulfill(321);
    });

    it("should be able to use resolver function", function (done) {
        function resolver(fulfill, reject, progress) {
            fulfill("resolved");
        }

        var p = new uP(resolver);

        p.then(function (ok) {
            ok.should.equal("resolved");
        }).callback(done);

    });
})

describe("Class methods", function () {
    it("should have thenable()", function () {
        uP.thenable.should.be.Function;
    });

    it("should have async()", function () {
        uP.async.should.be.Function;
    });

    it("should have defer()", function () {
        uP.defer.should.be.Function;
    });

})

describe("Promise.thenable", function () {
    it("should return true if thenable", function () {
        var p = new uP();

        uP.thenable(p).should.equal(true);

        var o = {
            then: function () {}
        };

        uP.thenable(o).should.equal(true);

    });

    it("should return false if not thenable", function () {
        var o = function () {};

        uP.thenable(o).should.equal(false);

        uP.thenable({
            then: true
        }).should.equal(false);
    });
});

describe("Promise async", function () {

    it("function expecting a nodejs callback", function (done) {
        function func1(a, b, c) {
            a.should.equal(1);
            b.should.equal(2);
            c(undefined, a + b);
        };

        var async = uP.async(func1);

        async(1, 2).then(function (x) {
            x.should.equal(3);
            done();
        }, done);
    });

    it("function expecting a nodejs callback using a callback", function (done) {
        function func1(a, b, c) {
            a.should.equal(1);
            b.should.equal(2);
            c(undefined, a + b);
        };

        var async = uP.async(func1, function (err, ret) {
            if(err) done(err);
            else {
                ret.should.equal(3);
                done();
            }
        });

        async(1, 2);
    });

    it("function returning a value", function (done) {
        function func2(a, b) {
            return a + b;
        }

        var async = uP.async(func2);

        async(1, 2).then(function (x) {
            x.should.equal(3);
            done();
        }, done);
    });

    it("function returning a value using a callback", function (done) {
        function func2(a, b) {
            return a + b;
        }

        var async = uP.async(func2, function (err, ret) {
            if(err) done(err);
            else {
                ret.should.equal(3);
                done();
            }
        });

        async(1, 2);

    });

});

describe("Promise defer", function () {
    it("should defer a function", function (done) {
        var called = false;

        function deferred() {
            called = true;
            return 123;
        }

        var p = uP.defer(deferred);

        p.then(function (x) {
            x.should.equal(123);
            called = true;
        }).callback(done);

        called.should.equal(false);
    });
});