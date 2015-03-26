QUnit.test("Invoke scope test", function(assert) {
    var done = assert.async();

    assert.expect(1);

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



QUnit.test("Invoke only method", function(assert) {
    var done = assert.async();
    assert.expect(4);
    var amoeba = new Amoeba();
    amoeba.use("auth", {
        invoke: function(context, callback) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.use, "auth");
            assert.equal(typeof(context.request.params), "undefined");
            assert.equal(typeof(callback), "undefined");
            done();
        }
    });
    amoeba.use("auth").invoke("test");
});

QUnit.test("Invoke method with param", function(assert) {
    var done = assert.async();
    assert.expect(4);
    var amoeba = new Amoeba();

    amoeba.use("auth", {
        invoke: function(context, callback) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.use, "auth");
            assert.equal(context.request.params.p1, "p2");
            assert.equal(typeof(callback), "undefined");
            done();
        }
    });
    amoeba.use("auth").invoke("test", {
        "p1": "p2"
    });
});

QUnit.test("Invoke method with params", function(assert) {
    var done = assert.async();
    assert.expect(4);
    var amoeba = new Amoeba();

    amoeba.use("auth", {
        invoke: function(context, callback) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.use, "auth");
            assert.equal(context.request.params.length, 3);
            assert.equal(typeof(callback), "undefined");
            done();
        }
    });
    amoeba.use("auth").invoke("test", [1, 2, 3]);
});


QUnit.test("Invoke method with callbacks", function(assert) {
    var done = assert.async();
    assert.expect(4);
    var amoeba = new Amoeba();
    amoeba.use("auth", {
        invoke: function(context, callback) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.use, "auth");
            assert.deepEqual(typeof(context.request.params), "undefined");
            callback(null, "ok");
        }
    });
    amoeba.use("auth").invoke("test", function(err, data) {
        assert.equal(data, "ok");
        done();
    });
});

QUnit.test("Amoeba invoke", function(assert) {
    var done = assert.async();

    var amoeba = new Amoeba();

    amoeba.use("auth", {
        invoke: function(context, callback) {
            assert.equal(context.request.params.p2, 2);
            assert.equal(context.request.method, "test");
            assert.equal(context.request.use, "auth");
            if (context.request.params.p1 == 1) {
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
