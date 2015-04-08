var assert = require("assert");
var Amoeba = require("../lib/amoeba");

describe('Amoeba', function() {
    var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
    });

    it('#root', function() {
        assert.deepEqual(amoeba.use("test").use("test3").root(), amoeba);
    });

    it('#use', function() {
        assert.equal(amoeba.use("test").path, "test");
        assert.equal(amoeba.use("test.test2").path, "test.test2");
        assert.equal(amoeba.use("test").use("test2").path, "test.test2");
    });

    it('#add', function() {
        amoeba.use("test").add({
            "router": "test"
        });
        assert.equal(amoeba.clients.test.router, "test");
    });

    it('#add mask', function() {
        amoeba.use("test.*").add({
            "test": 0
        });
        amoeba.use("*").add({
            "test": 1
        });
        assert.equal(amoeba.clients['test.*'].test, 0);
        assert.equal(amoeba.clients['*'].test, 1);
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
        amoeba.use("test.test").on("ev", function(data) {
            assert.equal(data.test, 1);
            counter = counter + 1;
            if (counter == total) {
                done();
            }
        });
        amoeba.emit("test.test", "ev", {
            "test": 1
        });
        amoeba.use("test.test").emit("ev", {
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
        amoeba.handler("test", "before_invoke", function(context, next) {
            next();
        });

        amoeba.use("test").handler("before_invoke", function(context, next) {
            next();
        });

        amoeba.use("tests").handler("before_invoke", function(context, next) {
            next();
        });

        assert.equal(amoeba.handlers('before_invoke').length, 3);
        assert.equal(amoeba.handlers('before_invoke', "test").length, 2);
    });

    it('#handler with mask', function() {
        amoeba.handler("test.test", "before_invoke", function(context, next) {
            next();
        });

        amoeba.use("test.*").handler("before_invoke", function(context, next) {
            next();
        });

        amoeba.use("*").handler("before_invoke", function(context, next) {
            next();
        });

        assert.equal(amoeba.handlers('before_invoke', "test.test").length, 3);
        assert.equal(amoeba.handlers('before_invoke').length, 3);
    });

    it('#invoke', function(done) {
        amoeba.use("test").add({
            invoke: function(context, next) {
                context.response.result = 5;
                next();
            }
        });
        amoeba.use("test").invoke("method", [1, 2, 3], function() {
            assert.equal(arguments[0], null);
            assert.equal(arguments[1], 5);
            done();
        });
    });

    it('#invoke mask', function(done) {
        var counter = 0;
        var total = 2;
        amoeba.use("*").add({
            invoke: function(context, next) {
                assert.ok(false);
            }
        });

        amoeba.use("test.*").add({
            invoke: function(context, next) {
                assert.equal(context.request.path, "test.test");
                context.response.result = 6;
                next();
            }
        });

        amoeba.use("test.test").invoke("method", [1, 2, 3], function() {
            assert.equal(arguments[0], null);
            assert.equal(arguments[1], 6);
            done();
        });
    });

    it('#invoke scope test', function(done) {
        amoeba.use("auth").add({
            scopeTest: function(callback) {
                return "ok";
            },
            invoke: function(context, next) {
                context.response.result = this.scopeTest();
                next();
            }
        });
        amoeba.use("auth").invoke("test", function(err, result) {
            assert.equal(result, "ok");
            done();
        });

    });

    it('#invoke only method', function(done) {
        amoeba.use("auth").add({
            invoke: function(context, next) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.path, "auth");
                assert.equal(typeof(context.response), "undefined");
                assert.equal(typeof(context.request.params), "undefined");
                next();
                done();
            }
        });
        amoeba.use("auth").invoke("test");
    });

    it('#invoke method with param', function(done) {
        amoeba.use("auth").add({
            invoke: function(context, next) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.path, "auth");
                assert.equal(context.request.params.p1, "p2");
                assert.equal(typeof(context.response), "undefined");
                next();
                done();
            }
        });
        amoeba.use("auth").invoke("test", {
            "p1": "p2"
        });
    });

    it('#invoke method with params', function(done) {
        amoeba.use("auth").add({
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
        amoeba.use("auth").invoke("test", ["1", "2", "3"]);
    });

    it('#invoke method with callbacks', function(done) {
        amoeba.use("auth").add({
            invoke: function(context, next) {
                context.response.result = "ok";
                assert.equal(context.request.method, "test");
                assert.equal(context.request.path, "auth");
                assert.equal(typeof(context.request.params), "undefined");
                next();
            }
        });
        amoeba.use("auth").invoke("test", function(err, data) {
            assert.equal(data, "ok");
            done();
        });
    });

    it('#invoke method with handlers', function(done) {
        amoeba.use("auth").add({
            invoke: function(context, next) {
                context.response.result = 6;
                next();
            }
        });
        amoeba.use("auth").handler("before_invoke", function(context, next) {
            context.response.result = 5;
            next();
        });
        amoeba.use("*").handler("after_invoke", function(context, next) {
            context.response.result = 7;
            next();
        });
        amoeba.use("auth").handler("after_invoke", function(context, next) {
            context.response.result = 8;
            next();
        });
        amoeba.use("authd").handler("after_invoke", function(context, next) {
            context.response.result = 9;
            next();
        });

        amoeba.use("auth").invoke("test", function(err, result) {
            assert.equal(result, 8);
            done();
        });
    });

});
