QUnit.test("Amoeba", function(assert) {
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
