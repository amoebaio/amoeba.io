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

ClientHolder.prototype.invoke = function(method, params, callback) {

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
    chain_bofore.start(context, function(context) {
        //success before_invoke
        self.client.invoke(context.request.use, context.request.method, context.request.params, function(error, result) {
            //set result
            context.response.error = error;
            context.response.result = result;
            //create after_invoke chain
            var chain_after = new Chain(self.handlers("after_invoke"));
            chain_after.start(context, function(context) {
                //success after_invoke
                callback(context.response.error, context.response.result);
            }, function(context) {
                //interrupted after_invoke
                callback(context.response.error, context.response.result);
            });
        });
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
