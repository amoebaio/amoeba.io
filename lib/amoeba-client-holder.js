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

    if (arguments.length == 1) {
        params = {};
        callback = function() {};
    } else if (arguments.length == 2) {
        if (typeof(arguments[1]) == "function") {
            params = {};
            callback = arguments[1];
        } else {
            params = arguments[1];
            callback = function() {};
        }
    } else if (arguments.length == 3) {
        params = arguments[1];
        callback = arguments[2];
    } else if (arguments.length > 3) {
        throw new Error("More than 3 arguments received");
    }

    var context = {
        request: {
            use: this.use,
            method: method,
            params: params
        },
        response: {
            error: null,
            result: null
        }
    };

    var self = this;
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
