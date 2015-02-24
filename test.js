QUnit.test("Amoeba invoke", function(assert) {
    var amoeba=new Amoeba();
    amoeba.service("auth", {"invoke": function(service, method, data, callback){
        assert.equal(service,"auth");
        assert.equal(method,"login");
        assert.equal(data.login,"admin");
        assert.equal(data.password,"admin");
    }});

    amoeba.service("auth").invoke("login", {
        login: 'admin',
        password: 'admin'
    }, function(err, data) {
        assert.equal(err, null);
        assert.equal(data.res, "login ok");
    });

});

QUnit.test("Behaviors", function(assert) {
        var done = assert.async();
        var amoeba=new Amoeba();
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