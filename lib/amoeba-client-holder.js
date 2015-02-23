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

module.exports = exports = ClientHolder;