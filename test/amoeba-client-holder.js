var assert = require("assert");
var Amoeba = require("../lib/amoeba.io").Amoeba;
var ClientHolder = require("../lib/amoeba.io").ClientHolder;
var LocalClient = require("../lib/amoeba.io").LocalClient;

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
