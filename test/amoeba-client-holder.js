var assert = require("assert");
var Amoeba = require("../lib/amoeba").Amoeba;
var ClientHolder = require("../lib/amoeba").ClientHolder;
var LocalClient = require("../lib/amoeba").LocalClient;

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
