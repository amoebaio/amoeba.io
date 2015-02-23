(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var ClientHolder=require('./amoeba-client-holder');

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



module.exports = exports = Amoeba;

},{"./amoeba-client-holder":1}]},{},[1,2]);
