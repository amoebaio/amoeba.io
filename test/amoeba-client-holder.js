var assert = require("assert");
var Amoeba = require("../lib/amoeba");

describe('ClientHolder', function() {
    var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
    });

    it('#name', function() {
        amoeba.service("auth", {
            invoke: function() {}
        });
        assert.equal("auth", amoeba.service("auth").service);
    });

    it('#invoke', function(done) {
        amoeba.service("auth", {
            invoke: function(service, method, params, callback) {
                assert.equal(params.p2, 2);
                assert.equal(method, "test");
                assert.equal(service, "auth");
                if (params.p1 == 1) {
                    callback(null, "ok");
                } else {
                    callback("error", null);
                }
            }
        });
        amoeba.service("auth").invoke("test", {
            p1: 1,
            p2: 2
        }, function(err, data) {
            assert.equal(data, "ok");
        });
        amoeba.service("auth").invoke("test", {
            p1: 2,
            p2: 2
        }, function(err, data) {
            assert.equal(err, "error");
            done();
        });

    });

    it('#behaviors', function() {
        amoeba.service("auth", {
            invoke: function() {}
        });
        amoeba.service("auth").behavior("before_invoke", function(data, next) {});
        amoeba.service("auth").behavior("before_invoke", function(data, next) {});
        amoeba.service("auth").behavior("after_invoke", function(data, next) {});
        assert.equal(amoeba.service("auth").behaviors("before_invoke").length, 2);
        assert.equal(amoeba.service("auth").behaviors("after_invoke").length, 1);
    });

    it('#invoke_behaviors', function(done) {
        amoeba.service("auth", {
            invoke: function(service, method, params, callback) {
                assert.equal(service, "auth");
                assert.equal(method, "test");
                if (params.p1 == 7) {
                    callback(null, {
                        "some": "data"
                    });
                }
            }
        });
        amoeba.service("auth").behavior("before_invoke", function(data, next) {
            if (data.params.p1 == 1) {
                data.params.p1 = 4;
            }
            next();
        });
        amoeba.service("auth").behavior("before_invoke", function(data, next) {
            if (data.params.p1 == 4) {
                data.params.p1 = 7;
            }
            next();
        });
        amoeba.service("auth").behavior("after_invoke", function(data, next) {
            if (data.result.some == "data") {
                data.result.complete = 1;
            }
            next();
        });
        amoeba.service("auth").invoke("test", {
            p1: 1,
            p2: 2
        }, function(err, result) {
            assert.equal(result.complete, 1);
            done();
        });
    });
});
