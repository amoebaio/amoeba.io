ClientHolder = function(client, service) {
    this.service = service;
    this.client = client;
    this.behaviors_list = [];
};

ClientHolder.prototype.invoke = function(method, params, callback) {

    var bahaviors_before = this.behaviors("before_invoke");
    var bahaviors_after = this.behaviors("after_invoke");

    var data = {
        service: this.service,
        method: method,
        params: params,
        callback: callback
    };

    var counterBefore = -1;
    var invoke = this.client.invoke;
    var nextBefore = function() {
        if (arguments.length === 0 || arguments.length === 1 && arguments[0] === true) {
            counterBefore++;
            if (bahaviors_before && bahaviors_before[counterBefore]) {
                bahaviors_before[counterBefore](data, nextBefore);
            } else {
                invoke(data.service, data.method, data.params, function(err, result) {
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

ClientHolder.prototype.behavior = function(type, func) {
    if (!this.behaviors_list[type]) {
        this.behaviors_list[type] = [];
    }
    this.behaviors_list[type].push(func);
};

ClientHolder.prototype.behaviors = function(type) {
    return this.behaviors_list[type];
};

module.exports = exports = ClientHolder;
