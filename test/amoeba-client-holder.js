var assert = require("assert");
var Amoeba = require("../lib/amoeba");

describe('ClientHolder', function() {
    var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
    });

    it('#name', function() {
        amoeba.use("auth", {
            scopeTest: function(){},
            invoke: function() {}
        });
        assert.equal("auth", amoeba.use("auth").use);
    });

    it('#invoke scope test', function(done) {
        amoeba.use("auth", {
            scopeTest: function(callback){
                callback(null, "ok");
            },
            invoke: function(use, method, params, callback) {
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

    it('#invoke', function(done) {
        amoeba.use("auth", {
            invoke: function(use, method, params, callback) {
                assert.equal(params.p2, 2);
                assert.equal(method, "test");
                assert.equal(use, "auth");
                if (params.p1 == 1) {
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

    it('#behaviors', function() {
        amoeba.use("auth", {
            invoke: function() {}
        });
        amoeba.use("auth").behavior("before_invoke", function(data, next) {});
        amoeba.use("auth").behavior("before_invoke", function(data, next) {});
        amoeba.use("auth").behavior("after_invoke", function(data, next) {});
        assert.equal(amoeba.use("auth").behaviors("before_invoke").length, 2);
        assert.equal(amoeba.use("auth").behaviors("after_invoke").length, 1);
    });

    it('#invoke_behaviors', function(done) {
        amoeba.use("auth", {
            invoke: function(use, method, params, callback) {
                assert.equal(use, "auth");
                assert.equal(method, "test");
                if (params.p1 == 7) {
                    callback(null, {
                        "some": "data"
                    });
                }
            }
        });
        amoeba.use("auth").behavior("before_invoke", function(data, next) {
            if (data.params.p1 == 1) {
                data.params.p1 = 4;
            }
            next();
        });
        amoeba.use("auth").behavior("before_invoke", function(data, next) {
            if (data.params.p1 == 4) {
                data.params.p1 = 7;
            }
            next();
        });
        amoeba.use("auth").behavior("after_invoke", function(data, next) {
            if (data.result.some == "data") {
                data.result.complete = 1;
            }
            next();
        });
        amoeba.use("auth").invoke("test", {
            p1: 1,
            p2: 2
        }, function(err, result) {
            assert.equal(result.complete, 1);
            done();
        });
    });
});
