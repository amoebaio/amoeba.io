(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Chain = require('chaining-tool');


ClientHolder = function(client, use) {
    this.use = use;
    this.client = client;
    this.handlers_list = {};
};

ClientHolder.prototype.handler = function(type, func) {
    if (!this.handlers_list[type]) {
        this.handlers_list[type] = [];
    }
    this.handlers_list[type].push(func);
};

ClientHolder.prototype.handlers = function(type) {
    return this.handlers_list[type] || [];
};

ClientHolder.prototype.invoke = function(method) {
    var self = this;

    var context = {
        request: {
            use: this.use,
            method: method
        },
        response: {
            error: null,
            result: null
        }
    };

    if (arguments.length == 1) {
        callback = function() {};
    } else if (arguments.length == 2) {
        if (typeof(arguments[1]) == "function") {
            callback = arguments[1];
        } else {
            context.request.params = arguments[1];
            callback = function() {};
        }
    } else if (arguments.length == 3) {
        context.request.params = arguments[1];
        callback = arguments[2];
    } else if (arguments.length > 3) {
        throw new Error("More than 3 arguments received");
    }


    //create before_invoke chain
    var chain_bofore = new Chain(self.handlers("before_invoke"));
    chain_bofore.add(function(context, next){
        self.client.invoke(context, function(error, result) {
            context.response.error = error;
            context.response.result = result;
            next();            
        });
    });
    chain_bofore.add(self.handlers("after_invoke"));

    chain_bofore.start(context, function(context) {
        //interrupted before_invoke
        callback(context.response.error, context.response.result);
    }, function(context) {
        //interrupted before_invoke
        callback(context.response.error, context.response.result);
    });

};

ClientHolder.prototype.on = function(event, callback, onadded) {
    this.client.on(this.use, event, callback, onadded);
};

ClientHolder.prototype.removeListener = function(event, listener, onremoved) {
    this.client.removeListener(this.use, event, listener, onremoved);
};

module.exports = exports = ClientHolder;

},{"chaining-tool":3}],2:[function(require,module,exports){
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

},{"./amoeba-client-holder":1}],3:[function(require,module,exports){
module.exports = require('./lib/chain.js');
},{"./lib/chain.js":4}],4:[function(require,module,exports){
/**
 * Main chain constructor
 * @param {Array} handlers
 */
var Chain = function(handlers) {
    //add handlers
    this.handlers = handlers || [];
    this.oncomplete = null;
    this.onbreak = null;

};

/**
 * Add handler or handlers to the end of chain
 * @param {function} handler
 */
Chain.prototype.add = function(handler) {
    if(typeof(handler)=="function"){
        this.handlers.push(handler);
    }else{
        for (var i = 0; i < handler.length; i++) {
            this.handlers.push(handler[i]);
        }
    }
};

/**
 * Start execution
 * @param  {Object} context
 * @param  {Function} oncomplete
 * @param  {Function} onbreak
 * @return
 */
Chain.prototype.start = function(context, oncomplete, onbreak) {
    this.oncomplete = oncomplete;
    this.onbreak = onbreak;
    this.next(0, context)();
};

/**
 * Create function for passing execution to next handler
 * @param  {Number}   i          index of handler
 * @param  {Object}   context
 * @return {Function} call this function you will pass execution to next handler
 */
Chain.prototype.next = function(i, context) {
    var self = this;
    return function() {
        if (arguments.length === 0 || arguments.length === 1 && arguments[0] === true) {

            if (self.handlers[i]) {
                self.handlers[i](context, self.next(i + 1, context));
            } else {
                self.oncomplete(context);
            }
        } else {
            if (self.onbreak) {
                self.onbreak(context);
            }
        }
    };
};

module.exports = exports = Chain;
},{}]},{},[1,2]);
