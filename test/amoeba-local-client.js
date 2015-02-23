var assert = require("assert");
var Amoeba = require("../lib/amoeba.io").Amoeba;
Auth = function() {};

Auth.prototype.login = function(data, callback) {
    if (data.login == "admin" && data.password == "admin") {
        callback(null, {
            "res": "login ok"
        });
    } else {
        callback({
            "res": "login fail"
        }, null);
    }
};

describe('LocalClient', function() {
    var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
        amoeba.service("auth", new LocalClient(new Auth()));
    });

    it('#invoke', function() {
        amoeba.service("auth").invoke("login", {
            login: 'admin',
            password: 'admin'
        }, function(err, data) {
            assert.equal(err, null);
            assert.equal(data.res, "login ok");
        });
        amoeba.service("auth").invoke("login", {
            login: 'admins',
            password: 'admin'
        }, function(err, data) {
            assert.equal(data, null);
            assert.equal(err.res, "login fail");
        });
    });

});
