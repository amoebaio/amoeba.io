QUnit.test("Amoeba invoke", function(assert) {
    var amoeba = new Amoeba();
    amoeba.use("auth", {
        "invoke": function(use, method, data, callback) {
            assert.equal(use, "auth");
            assert.equal(method, "login");
            assert.equal(data.login, "admin");
            assert.equal(data.password, "admin");
        }
    });

    amoeba.use("auth").invoke("login", {
        login: 'admin',
        password: 'admin'
    }, function(err, data) {
        assert.equal(err, null);
        assert.equal(data.res, "login ok");
    });

});

QUnit.test("Invoke scope test", function(assert) {
    var done = assert.async();

    assert.expect( 1 );

    var amoeba = new Amoeba();
    amoeba.use("auth", {
        scopeTest: function(callback) {
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
});
