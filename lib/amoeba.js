var ClientHolder = require('./amoeba-client-holder');

Amoeba = function() {
    this.servers = [];
    this.objects = {};
};

/**
 * Set/get Object by name
 * @return {AmoobaClientHolder}
 */
Amoeba.prototype.use = function() {
    if (arguments.length == 1) {
        if (this.objects[arguments[0]]) {
            return this.objects[arguments[0]];
        } else {
            throw new Error("Service '" + arguments[0] + "' not found");
        }
    } else if (arguments.length == 2) {
        var holder = new ClientHolder(arguments[1], arguments[0]);
        this.objects[arguments[0]] = holder;
        return holder;
    }
};

Amoeba.prototype.server = function(server) {
    server.amoeba(this);
    this.servers.push(server);
};

module.exports = exports = Amoeba;
