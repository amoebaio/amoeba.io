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

});
