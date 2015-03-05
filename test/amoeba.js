var assert = require("assert");
var Amoeba = require("../lib/amoeba");

describe('Amoeba', function() {
	var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
    });

    it('#use', function() {
		amoeba.use("test",{});
		assert.ok(amoeba.use("test"));
    });

    it('#use not found', function(done) {
		amoeba.use("test",{});
		try{
			amoeba.use("tests");
			assert.ok(false, "Need to throw exception");
		}catch(e){
			assert.equal("Service 'tests' not found", e.message);
			done();
		}
    });

    it('#server', function() {

    });

});
