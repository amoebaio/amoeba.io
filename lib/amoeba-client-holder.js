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

    var callback = null;

    if (arguments.length == 2) {
        if (typeof(arguments[1]) == "function") {
            callback = arguments[1];
        } else {
            context.request.params = arguments[1];
        }
    } else if (arguments.length == 3) {
        context.request.params = arguments[1];
        callback = arguments[2];
    } else if (arguments.length > 3) {
        throw new Error("More than 3 arguments received");
    }


    //Chain of responsibility
    var chain = new Chain(self.handlers("before_invoke"));
    chain.add(function(context, next) {

        if (callback !== null) {
            self.client.invoke(context, function(error, result) {
                context.response.error = error;
                context.response.result = result;
                next();
            });
        } else {
            self.client.invoke(context);
            next();
        }
    });
    chain.add(self.handlers("after_invoke"));

    chain.start(context, function(context) {
        //success
        if (callback !== null) {
            callback(context.response.error, context.response.result);
        }
    }, function(context) {
        //interrupted
        if (callback !== null) {
            callback(context.response.error, context.response.result);
        }
    });

};

ClientHolder.prototype.on = function(event, callback, onadded) {
    this.client.on(this.use, event, callback, onadded);
};

ClientHolder.prototype.removeListener = function(event, listener, onremoved) {
    this.client.removeListener(this.use, event, listener, onremoved);
};

module.exports = exports = ClientHolder;
