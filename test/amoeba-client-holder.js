var assert = require("assert");
var Amoeba = require("../lib/amoeba");
var LocalClient = require("../lib/amoeba-local-client");

describe('ClientHolder', function() {
    var amoeba;

    beforeEach(function() {
        amoeba = new Amoeba();
        amoeba.service("auth", new LocalClient({}));
    });

    it('#name', function() {
        
    });

    it('#invoke', function() {

    });

});
