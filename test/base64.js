var Base64 = require('../lib/utils/base64');

describe('module:base64', function () {
    describe('methods', function () {
        it('should have encode, decode, encodeURL, decodeURL methods', function () {
            Base64.should.have.ownProperty('encode');
            Base64.should.have.ownProperty('decode');
            Base64.should.have.ownProperty('encodeURL');
            Base64.should.have.ownProperty('decodeURL');
        })
    })

    describe("encode", function () {
        it('should encode("fool") => "Zm9vbA=="', function () {
            Base64.encode("fool").should.equal("Zm9vbA==");
        })
    })

    describe("decode", function () {
        it('should decode("Zm9vbA==") => "fool"', function () {
            Base64.decode("Zm9vbA==").should.equal("fool");
        })
    })

    describe("encodeURL", function () {
        it('should encodeURL("hello world?") => "aGVsbG8gd29ybGQ_"', function () {
            Base64.encodeURL("hello world?").should.equal("aGVsbG8gd29ybGQ_");
        })
    })

    describe("decodeURL", function () {
        it('should decudeURL("aGVsbG8gd29ybGQ_" => "hello world?"', function () {
            Base64.decodeURL("aGVsbG8gd29ybGQ_").should.equal("hello world?");
        })
    })
})