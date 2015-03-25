var assert = require("assert");
var Amoeba = require("../lib/amoeba");

describe('ClientHolder', function() {
    var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
    });

    it('#name', function() {
        amoeba.use("auth", {
            scopeTest: function() {},
            invoke: function() {}
        });
        assert.equal("auth", amoeba.use("auth").use);
    });

    it('#invoke scope test', function(done) {
        amoeba.use("auth", {
            scopeTest: function(callback) {
                callback(null, "ok");
            },
            invoke: function(context, callback) {
                this.scopeTest(callback);
            }
        });
        amoeba.use("auth").invoke("test", {
            p1: 1,
            p2: 2
        }, function(err, data) {
            assert.equal(data, "ok");
            done();
        });
        assert.equal("auth", amoeba.use("auth").use);
    });


    it('#invoke only method', function(done) {
        amoeba.use("auth", {
            invoke: function(context, callback) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.use, "auth");
                assert.deepEqual(context.request.params, {});
                callback();
                done();
            }
        });
        amoeba.use("auth").invoke("test");
    });


    it('#invoke method with params', function(done) {
        amoeba.use("auth", {
            invoke: function(context, callback) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.use, "auth");
                assert.equal(context.request.params.p1, "p2");
                callback();
                done();
            }
        });
        amoeba.use("auth").invoke("test", {
            "p1": "p2"
        });
    });

    it('#invoke method with callbacks', function(done) {
        amoeba.use("auth", {
            invoke: function(context, callback) {
                assert.equal(context.request.method, "test");
                assert.equal(context.request.use, "auth");
                assert.deepEqual(context.request.params, {});
                callback(null, "ok");
            }
        });
        amoeba.use("auth").invoke("test", function(err, data) {
            assert.equal(data, "ok");
            done();
        });
    });

    it('#invoke', function(done) {
        amoeba.use("auth", {
            invoke: function(context, callback) {
                assert.equal(context.request.params.p2, 2);
                assert.equal(context.request.method, "test");
                assert.equal(context.request.use, "auth");
                if (context.request.params.p1 == 1) {
                    callback(null, "ok");
                } else {
                    callback("error", null);
                }
            }
        });
        amoeba.use("auth").invoke("test", {
            p1: 1,
            p2: 2
        }, function(err, data) {
            assert.equal(data, "ok");
        });
        amoeba.use("auth").invoke("test", {
            p1: 2,
            p2: 2
        }, function(err, data) {
            assert.equal(err, "error");
            done();
        });

    });
});
