QUnit.test("Invoke scope test", function(assert) {
    var done = assert.async();

    assert.expect(1);

    var amoeba = new Amoeba();
    amoeba.path("auth").as({
        scopeTest: function() {
            return "ok";
        },
        invoke: function(context, next) {
            context.response.result = this.scopeTest();
            next();
        }
    });
    amoeba.path("auth").invoke("test", {
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
    amoeba.path("auth").as({
        invoke: function(context, next) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.path, "auth");
            assert.equal(typeof(context.request.params), "undefined");
            assert.equal(typeof(context.response), "undefined");
            next();
            done();
        }
    });
    amoeba.path("auth").invoke("test");
});

QUnit.test("Invoke method with argument", function(assert) {
    var done = assert.async();
    assert.expect(4);
    var amoeba = new Amoeba();

    amoeba.path("auth").as({
        invoke: function(context, next) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.path, "auth");
            assert.deepEqual(context.request.arguments[0], {"p1": "p2"});
            assert.equal(typeof(context.response), "undefined");
            next();
            done();
        }
    });
    amoeba.path("auth").invoke("test", {
        "p1": "p2"
    });
});

QUnit.test("Invoke method with arguments", function(assert) {
    var done = assert.async();
    assert.expect(4);
    var amoeba = new Amoeba();

    amoeba.path("auth").as({
        invoke: function(context, next) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.path, "auth");
            assert.equal(context.request.arguments.length, 3);
            assert.equal(typeof(context.response), "undefined");
            next();
            done();
        }
    });
    amoeba.path("auth").invoke("test", 1, 2, 3);
});


QUnit.test("Invoke method with callbacks", function(assert) {
    var done = assert.async();
    assert.expect(4);
    var amoeba = new Amoeba();
    amoeba.path("auth").as({
        invoke: function(context, next) {
            assert.equal(context.request.method, "test");
            assert.equal(context.request.path, "auth");
            assert.deepEqual(typeof(context.request.params), "undefined");
            context.response.result = "ok";
            next();
        }
    });
    amoeba.path("auth").invoke("test", function(err, data) {
        assert.equal(data, "ok");
        done();
    });
});

QUnit.test("Amoeba invoke", function(assert) {
    var done = assert.async();

    var amoeba = new Amoeba();

    amoeba.path("auth").as({
        invoke: function(context, next) {
            assert.equal(context.request.arguments[0].p2, 2);
            assert.equal(context.request.method, "test");
            assert.equal(context.request.path, "auth");
            if (context.request.arguments[0].p1 == 1) {
                context.response.result = "ok";
            } else {
                context.response.error = "error";
            }
            next();
        }
    });
    amoeba.path("auth").invoke("test", {
        p1: 1,
        p2: 2
    }, function(err, data) {
        assert.equal(data, "ok");
    });
    amoeba.path("auth").invoke("test", {
        p1: 2,
        p2: 2
    }, function(err, data) {
        assert.equal(err, "error");
        done();
    });

});
