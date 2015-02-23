Amoeba = function() {
    this.servers = [];
    this.serviceHolders = [];
};

/**
 * Set/get service by name
 * @return {AmoobaClientHolder}
 */
Amoeba.prototype.service = function() {
    if (arguments.length == 1) {
        return this.serviceHolders[arguments[0]];
    } else if (arguments.length == 2) {
        var holder = new ClientHolder(arguments[1]);
        holder.name(arguments[0]);
        this.serviceHolders[arguments[0]] = holder;
        return holder;
    }
};

Amoeba.prototype.server = function(server) {
    server.eventer(this);
    this.servers.push(server);
};

// Client holder implementation
ClientHolder = function(s) {
    this.serviceName = null;
    this.serviceExecuter = s;
};

ClientHolder.prototype.name = function(name) {
    this.serviceName = name;
};

ClientHolder.prototype.invoke = function(method, data, callback) {
    this.serviceExecuter.invoke(this.serviceName, method, data, callback);
};

//Local client implementation
LocalClient = function(service) {
    this.service = service;
};
/**
 * Main point
 * @param  {String}   serviceName 
 * @param  {String}   method      [description]
 * @param  {Object}   data        [description]
 * @param  {Function} callback    [description]
 * @return
 */
LocalClient.prototype.invoke = function(serviceName, method, data, callback) {
    this.service[method].apply(this.service, [data, callback]);
};

module.exports.Amoeba = exports.Amoeba = Amoeba;
module.exports.ClientHolder = exports.ClientHolder = ClientHolder;
module.exports.LocalClient = exports.LocalClient = LocalClient;