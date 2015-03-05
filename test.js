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

QUnit.test("Behaviors", function(assert) {
    var done = assert.async();
    var amoeba = new Amoeba();
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
