(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ClientHolder = function(client, use) {
    this.use = use;
    this.client = client;
    this.behaviors_list = [];
};

ClientHolder.prototype.behavior = function(type, func) {
    if (!this.behaviors_list[type]) {
        this.behaviors_list[type] = [];
    }
    this.behaviors_list[type].push(func);
};

ClientHolder.prototype.behaviors = function(type) {
    return this.behaviors_list[type];
};

ClientHolder.prototype.invoke = function(method, params, callback) {

    var bahaviors_before = this.behaviors("before_invoke");
    var bahaviors_after = this.behaviors("after_invoke");

    var data = {
        use: this.use,
        method: method,
        params: params,
        callback: callback
    };

    var counterBefore = -1;
    var client = this.client;
    var nextBefore = function() {
        if (arguments.length === 0 || arguments.length === 1 && arguments[0] === true) {
            counterBefore++;
            if (bahaviors_before && bahaviors_before[counterBefore]) {
                bahaviors_before[counterBefore](data, nextBefore);
            } else {
                client.invoke(data.use, data.method, data.params, function(err, result) {
                    var counterAfter = -1;
                    data.err = err;
                    data.result = result;

                    var nextAfter = function() {
                        counterAfter++;
                        if (bahaviors_after && bahaviors_after[counterAfter]) {
                            bahaviors_after[counterAfter](data, nextAfter);
                        } else {
                            data.callback(data.err, data.result);
                        }
                    };
                    nextAfter();
                });
            }
        } else {
            data.callback(data.err, data.result);
        }
    };
    nextBefore();
};

ClientHolder.prototype.on = function(event, callback, onadded) {
    this.client.on(this.use, event, callback, onadded);
};

ClientHolder.prototype.removeListener = function(event, listener, onremoved) {
    this.client.removeListener(this.use, event, listener, onremoved);
};

module.exports = exports = ClientHolder;

},{}],2:[function(require,module,exports){
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

},{"./amoeba-client-holder":1}]},{},[1,2]);
