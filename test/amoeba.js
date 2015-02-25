var assert = require("assert");
var Amoeba = require("../lib/amoeba");

describe('Amoeba', function() {
	var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
    });

    it('#service', function() {
		amoeba.service("test",{});
		assert.ok(amoeba.service("test"));
    });

    it('#service not found', function(done) {
		amoeba.service("test",{});
		try{
			amoeba.service("tests");
			assert.ok(false, "Need to throw exception");
		}catch(e){
			assert.equal("Service 'tests' not found", e.message);
			done();
		}
    });

    it('#server', function() {

    });

});
