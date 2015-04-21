var Amoeba = require("amoeba.io");
var AmoebaLocalClient = require("amoeba.io-local-client");
var AmoebaSocketServer = require("amoeba.io-socket-server");

function Cube() {}

Cube.prototype.move = function(x, y) {
    if (x < 0) x = 0;
    if (x > 1030) x = 1030;
    if (y < 0) y = 0;
    if (y > 170) y = 170;
    this.emit("moved", {
        x: x,
        y: y
    });
};

var amoeba = new Amoeba();
amoeba.path("cube").as(new AmoebaLocalClient(new Cube()));

new AmoebaSocketServer(amoeba, {
    port: "8092"
});
