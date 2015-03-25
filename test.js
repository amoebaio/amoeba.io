QUnit.test("Amoeba invoke", function(assert) {
    var amoeba = new Amoeba();
    amoeba.use("auth", {
        "invoke": function(context, callback) {
            assert.equal(context.request.use, "auth");
            assert.equal(context.request.method, "login");
            assert.equal(context.request.params.login, "admin");
            assert.equal(context.request.params.password, "admin");
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
});
