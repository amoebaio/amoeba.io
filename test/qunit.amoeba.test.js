QUnit.test("Amoeba", function(assert) {

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
