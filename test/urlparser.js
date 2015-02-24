var url = require('../lib/utils/urlparser');


describe('Url', function () {
    describe('methods', function () {
        it('parse', function () {
            url.should.have.ownProperty('parse');
        })

        it('host', function () {
            url.should.have.ownProperty('host');
        })

        it('path', function () {
            url.should.have.ownProperty('path');
        })

        it('query', function () {
            url.should.have.ownProperty('query');
        })

        it('url', function () {
            url.should.have.ownProperty('toString');
        })
    })

    describe('host', function () {
        it('host("http://127.0.0.1:1234/test:me")', function () {
            var parsed = url.parse("http://127.0.0.1:1234/test:me");
            url.host(parsed).should.eql("http://127.0.0.1:1234");
        })

        it('host("test.com:1234/test#hash")', function () {
            var parsed = url.parse("test.com:1234/test#hash");
            url.host(parsed).should.eql("test.com:1234");
        })
    })

    describe('path', function () {
        it('path("http://127.0.0.1:1234/test:me")', function () {
            var parsed = url.parse("http://127.0.0.1:1234/test:me");
            url.path(parsed).should.eql("/test:me");
        })

        it('path("test.com:1234/test#hash?a=b")', function () {
            var parsed = url.parse("test.com:1234/test#hash?a=b");
            url.path(parsed).should.eql("/test#hash");
        })
    })

    describe('query', function () {
        it('query("http://127.0.0.1:1234/test:me?a=1")', function () {
            var parsed = url.parse("http://127.0.0.1:1234/test:me?a=1");
            url.query(parsed).should.eql("?a=1");
        })

        it('query("test.com:1234/test#hash?a=b&b=2")', function () {
            var parsed = url.parse("test.com:1234/test#hash?a=1&b=2");
            url.query(parsed).should.eql("?a=1&b=2");
        })
    })



    describe('parse', function () {
        it('/hello', function () {
            var parsed = url.parse('/hello');
            parsed.should.eql({
                path: {
                    base: 'hello'
                }
            })

            parsed.toString().should.equal("/hello");
        })

        it('/hello.world', function () {
            var parsed = url.parse('/hello.world');
            parsed.should.eql({
                path: {
                    base: 'hello.world'
                }
            })

            parsed.toString().should.equal("/hello.world");
        })


        it('/hello:world', function () {
            var parsed = url.parse('/hello:world');
            parsed.should.eql({
                path: {
                    base: 'hello',
                    name: 'world'
                }
            })

            parsed.toString().should.equal("/hello:world");
        })

        it('/hello:/world', function () {
            var parsed = url.parse('/hello:/world');
            parsed.should.eql({
                path: {
                    base: 'hello',
                    name: '/world'
                }
            })

            parsed.toString().should.equal("/hello:/world");
        })

        it('/hello:/world', function () {
            var parsed = url.parse('/hello:/world.file');
            parsed.should.eql({
                path: {
                    base: 'hello',
                    name: '/world.file'
                }
            })

            parsed.toString().should.equal('/hello:/world.file');
        })

        it('/hello:world#hash', function () {
            var parsed = url.parse('/hello:world#hash');
            parsed.should.eql({
                path: {
                    base: 'hello',
                    name: 'world',
                    hash: 'hash'
                }
            })

            parsed.toString().should.equal('/hello:world#hash');
        })

        it('/hello:world#hash?query=test', function () {
            var parsed = url.parse('/hello:world#hash?query=test');
            parsed.should.eql({
                path: {
                    base: 'hello',
                    name: 'world',
                    hash: 'hash'
                },
                query: {
                    parts: ['query=test'],
                    "params": {
                        query: 'test'
                    }
                }
            })

            parsed.toString().should.equal('/hello:world#hash?query=test');
        })

        it('/hello:world#hash?query=test&another=option', function () {
            var parsed = url.parse('/hello:world#hash?query=test&another=option');
            parsed.should.eql({
                path: {
                    base: 'hello',
                    name: 'world',
                    hash: 'hash'
                },
                query: {
                    parts: ['query=test', 'another=option'],
                    "params": {
                        query: 'test',
                        another: 'option'
                    }
                }
            })

            parsed.toString().should.equal('/hello:world#hash?query=test&another=option');
        })

        it('http://test.com', function () {
            var parsed = url.parse('http://test.com');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.com"
                }
            });

            parsed.toString().should.equal('http://test.com');
        })

        it('file:///test.file', function () {
            var parsed = url.parse('file:///test.file');
            parsed.should.eql({
                host: {
                    protocol: "file"
                },
                path: {
                    base: "test.file"
                }
            });

            parsed.toString().should.equal('file:///test.file');
        })

        it('http://test.com/hello', function () {
            var parsed = url.parse('http://test.com/hello');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.com"
                },
                path: {
                    base: "hello"
                }
            });

            parsed.toString().should.equal('http://test.com/hello');
        })

        it('http://test.com/hello:world', function () {
            var parsed = url.parse('http://test.com/hello:world');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.com"
                },
                path: {
                    base: "hello",
                    name: "world"
                }
            });

            parsed.toString().should.equal('http://test.com/hello:world');
        })

        it('scp://user:pass@test.com:world', function () {
            var parsed = url.parse('scp://user:pass@test.com:world');
            parsed.should.eql({
                host: {
                    protocol: "scp",
                    hostname: "test.com",
                    username: "user",
                    password: "pass"
                },
                path: {
                    name: "world"
                }
            });

            parsed.toString().should.equal('scp://user:pass@test.com:world');
        })

        it('http://test.com/?what=hello', function () {
            var parsed = url.parse('http://test.com/?what=hello');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.com"
                },
                query: {
                    parts: ["what=hello"],
                    params: {
                        "what": "hello"
                    }
                }
            });

            parsed.toString().should.equal('http://test.com?what=hello'); // note: slash removed before query string
        })

        it('http://test.com/?what=hello&x=132', function () {
            var parsed = url.parse('http://test.com/?what=hello&x=132');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.com"
                },
                query: {
                    parts: ["what=hello", "x=132"],
                    params: {
                        "what": "hello",
                        "x": "132"
                    }
                }
            });

            parsed.toString().should.equal('http://test.com?what=hello&x=132');
        })

        it('http://user:pass@test.com', function () {
            var parsed = url.parse('http://user:pass@test.com');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.com",
                    username: "user",
                    password: "pass"
                }
            });

            parsed.toString().should.equal('http://user:pass@test.com');
        })


        it('ftp://user:pass@test.com', function () {
            var parsed = url.parse('ftp://user:pass@test.com');
            parsed.should.eql({
                host: {
                    protocol: "ftp",
                    hostname: "test.com",
                    username: "user",
                    password: "pass"
                }
            });

            parsed.toString().should.equal('ftp://user:pass@test.com');
        })

        it('https://user:pass@localhost:8529/path', function () {
            var parsed = url.parse("https://user:pass@localhost:8529/path");
            parsed.should.eql({
                host: {
                    protocol: "https",
                    hostname: "localhost",
                    username: "user",
                    password: "pass",
                    port: "8529"
                },
                path: {
                    base: "path"
                }
            });

            parsed.toString().should.equal("https://user:pass@localhost:8529/path");
        })

        it('http://user:pass@test.a-dash.com/path', function () {
            var parsed = url.parse('http://user:pass@test.a-dash.com/path');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.a-dash.com",
                    username: "user",
                    password: "pass"
                },
                path: {
                    base: "path"
                }
            });

            parsed.toString().should.equal('http://user:pass@test.a-dash.com/path');
        })

        it('http://user:pass@test.com/index.html#start', function () {
            var parsed = url.parse('http://user:pass@test.com/index.html#start');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "test.com",
                    username: "user",
                    password: "pass"
                },
                path: {
                    base: "index.html",
                    hash: "start"
                }
            });

            parsed.toString().should.equal('http://user:pass@test.com/index.html#start');
        })

        it('http://user:pass@123.123.10.1/index.html#start?test=something', function () {
            var parsed = url.parse('http://user:pass@123.123.10.1/index.html#start?test=something');
            parsed.should.eql({
                host: {
                    protocol: "http",
                    hostname: "123.123.10.1",
                    username: "user",
                    password: "pass"
                },
                path: {
                    base: "index.html",
                    hash: "start"
                },
                query: {
                    parts: ["test=something"],
                    params: {
                        "test": "something"
                    }
                }
            });

            parsed.toString().should.equal('http://user:pass@123.123.10.1/index.html#start?test=something');
        })
    })
})