var assert = require("assert");
var Amoeba = require("../lib/amoeba");

describe('Amoeba', function() {
    var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
    });

    it('#root', function() {
        assert.deepEqual(amoeba.path("test").path("test3").root(), amoeba);
    });

    it('#use', function() {
        assert.equal(amoeba.path("test")._path, "test");
        assert.equal(amoeba.path("test.test2")._path, "test.test2");
    });

    it('#as', function() {
        amoeba.path("test").as({
            "router": "test"
        });
        assert.equal(amoeba._vacuols.test.router, "test");
    });

    it('#as callback on init', function(done) {
        amoeba.path("t.*").as({
            init: function(amoeba, oncomplete) {
                oncomplete(null, {
                    success: true
                });
            }
        }, function(err, result) {
            assert.ok(result.success);
            done();
        });
    });

    it('#add mask', function() {
        amoeba.path("test.*").as({
            "test": 0
        });
        amoeba.path("*").as({
            "test": 1
        });
        assert.equal(amoeba._vacuols['test.*'].test, 0);
        assert.equal(amoeba._vacuols['*'].test, 1);
    });


    it('#on emit', function(done) {
        var counter = 0;
        var total = 4;
        amoeba.on("test.test", "ev", function(data) {
            assert.equal(data.test, 1);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });
        amoeba.path("test.test").on("ev", function(data) {
            assert.equal(data.test, 1);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });
        amoeba.emit("test.test", "ev", {
            "test": 1
        });
        amoeba.path("test.test").emit("ev", {
            "test": 1
        });
    });

    it('#on emit mask', function(done) {
        var counter = 0;
        var total = 5;

        amoeba.on("*", "*", function() {
            assert.ok(true);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });
        amoeba.on("test.test", "ev", function() {
            assert.ok(true);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });
        amoeba.on("test.test", "*", function() {
            assert.ok(true);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });
        amoeba.on("*", "ev", function() {
            assert.ok(true);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });
        amoeba.on("test.*", "ev", function() {
            assert.ok(true);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });

        amoeba.on("tests.*", "ev", function() {
            assert.ok(false);
        });

        amoeba.emit("test.test", "ev", {
            "test": 1
        });

    });


    it('#handler', function() {
        amoeba.use("test", "before_invoke", function(context, next) {
            next();
        });

        amoeba.path("test").use("before_invoke", function(context, next) {
            next();
        });

        amoeba.path("tests").use("before_invoke", function(context, next) {
            next();
        });

        assert.equal(amoeba.handlers('before_invoke').length, 3);
        assert.equal(amoeba.handlers('before_invoke', "test").length, 2);
    });

    it('#handler with mask', function() {
        amoeba.use("test.test", "before_invoke", function(context, next) {
            next();
        });

        amoeba.path("test.*").use("before_invoke", function(context, next) {
            next();
        });

        amoeba.path("*").use("before_invoke", function(context, next) {
            next();
        });

        assert.equal(amoeba.handlers('before_invoke', "test.test").length, 3);
        assert.equal(amoeba.handlers('before_invoke').length, 3);
    });

    it('#invoke', function(done) {
        amoeba.path("test").as({
            invoke: function(context, next) {
                context.response.result = 5;
                next();
            }
        });
        amoeba.path("test").invoke("method", [1, 2, 3], function() {
            assert.equal(arguments[0], null);
            assert.equal(arguments[1], 5);
            done();
        });
    });

    it('#invoke mask', function(done) {
        var counter = 0;
        var total = 2;
        amoeba.path("*").as({
            invoke: function(context, next) {
                assert.ok(false);
            }
        });

        amoeba.path("test.*").as({
            invoke: function(context, next) {
                assert.equal(context.request.path, "test.test");
                context.response.result = 6;
                next();
            }
        });

        amoeba.path("test.test").invoke("method", [1, 2, 3], function() {
            assert.equal(arguments[0], null);
            assert.equal(arguments[1], 6);
            done();
        });
    });

    it('#invoke scope test', function(done) {
        amoeba.path("auth").as({
            scopeTest: function(callback) {
                return "ok";
            },
            invoke: function(context, next) {
                context.response.result = this.scopeTest();
                next();
            }
        });
        amoeba.path("auth").invoke("test", function(err, result) {
            assert.equal(result, "ok");
            done();
        });

    });

    it('#invoke only method', function(done) {
        amoeba.path("auth").as({
            invoke: function(context, next) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.path, "auth");
                assert.equal(typeof(context.response), "undefined");
                assert.equal(typeof(context.request.params), "undefined");
                next();
                done();
            }
        });
        amoeba.path("auth").invoke("test");
    });

    it('#invoke method with param', function(done) {
        amoeba.path("auth").as({
            invoke: function(context, next) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.path, "auth");
                assert.equal(context.request.params.p1, "p2");
                assert.equal(typeof(context.response), "undefined");
                next();
                done();
            }
        });
        amoeba.path("auth").invoke("test", {
            "p1": "p2"
        });
    });

    it('#invoke method with params', function(done) {
        amoeba.path("auth").as({
            invoke: function(context, next) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.path, "auth");
                assert.equal(context.request.params[0], "1");
                assert.equal(context.request.params[1], "2");
                assert.equal(context.request.params[2], "3");
                assert.equal(typeof(context.response), "undefined");
                done();
            }
        });
        amoeba.path("auth").invoke("test", ["1", "2", "3"]);
    });

    it('#invoke method with callbacks', function(done) {
        amoeba.path("auth").as({
            invoke: function(context, next) {
                context.response.result = "ok";
                assert.equal(context.request.method, "test");
                assert.equal(context.request.path, "auth");
                assert.equal(typeof(context.request.params), "undefined");
                next();
            }
        });
        amoeba.path("auth").invoke("test", function(err, data) {
            assert.equal(data, "ok");
            done();
        });
    });

    it('#invoke method with handlers', function(done) {
        amoeba.path("auth").as({
            invoke: function(context, next) {
                context.response.result = 6;
                next();
            }
        });
        amoeba.path("auth").use("before_invoke", function(context, next) {
            context.response.result = 5;
            next();
        });
        amoeba.path("*").use("after_invoke", function(context, next) {
            context.response.result = 7;
            next();
        });
        amoeba.path("auth").use("after_invoke", function(context, next) {
            context.response.result = 8;
            next();
        });
        amoeba.path("authd").use("after_invoke", function(context, next) {
            context.response.result = 9;
            next();
        });

        amoeba.path("auth").invoke("test", function(err, result) {
            assert.equal(result, 8);
            done();
        });
    });

    // it('#on path', function(done) {
    //     amoeba.path("t.*").as(new LocalClient(new Auth()));
    //     amoeba.path("*").on("*", function() {
    //         done();
    //     });

    //     amoeba.path("t.test").invoke("event1");
    // });

});
