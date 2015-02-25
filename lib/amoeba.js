var ClientHolder=require('./amoeba-client-holder');

Amoeba = function() {
    this.servers = [];
    this.serviceHolders = {};
};

/**
 * Set/get service by name
 * @return {AmoobaClientHolder}
 */
Amoeba.prototype.service = function() {
    if (arguments.length == 1) {
        if(this.serviceHolders[arguments[0]]){
            return this.serviceHolders[arguments[0]];
        }else{
            throw  new Error("Service '"+arguments[0]+"' not found");
        }
    } else if (arguments.length == 2) {
        var holder = new ClientHolder(arguments[1], arguments[0]);
        this.serviceHolders[arguments[0]] = holder;
        return holder;
    }
};

Amoeba.prototype.server = function(server) {
    server.eventer(this);
    this.servers.push(server);
};



module.exports = exports = Amoeba;
