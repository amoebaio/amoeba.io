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
