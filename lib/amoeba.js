var Chain = require('chaining-tool');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Creates a new Amoeba
 * @class
 * @author Maksym Pomazan
 * @version 0.2.0
 * @param {Amoeba} parent The parent amoeba
 * @param {String} p      Path for current amoeba
 */
Amoeba = function(parent, p) {
    this._parent = parent || null;
    this._path = p || null;
    this._vacuols = {};
    this._handlers = {};
};

util.inherits(Amoeba, EventEmitter);

/**
 * Method return root amoeba
 *
 * @return {Amoeba} The root amoeba
 */
Amoeba.prototype.root = function() {
    if (this._parent) {
        return this._parent.root();
    } else {
        return this;
    }
};

/**
 * Method return new Amoeba accroding path
 *
 * @example
 * var amoeba = new Amoeba();
 * amoeba.path("chat").on("message", function(){});
 * @param  {String} p Path
 * @return {Amoeba}   new created amoeba
 */
Amoeba.prototype.path = function(p) {
    return new Amoeba(this.root(), p);
};

/**
 * Method synonim for path method
 */
Amoeba.prototype.vacuole = Amoeba.prototype.path;

/**
 * Route amoeba path to Object
 *
 * @param {Object} Object for route
 * @return {Amoeba} self for chain execution
 */
Amoeba.prototype.as = function() {
    if (this._path) {
        this.root()._vacuols[this._path] = arguments[0];
        if (arguments[0].init) {
            arguments[0].init(this, arguments[1]);
        } else {
            if (arguments[1]) {
                arguments[1](null, {
                    success: true
                });
            }
        }
        return this;
    } else {
        throw new Error("Path not found");
    }
};

/**
 * Add event listener
 *
 * @param {String} event Event to listen. Can be mask.
 * @param {Function} callback Callback function
 * @return {Amoeba} self for chain execution
 */
Amoeba.prototype.on = function() {
    if (this._parent) {
        Array.prototype.splice.call(arguments, 1, 0, this._path);
        this.on.apply(this.root(), arguments);
    } else {
        EventEmitter.prototype.on.call(this, arguments[0] + ":" + arguments[1], arguments[2]);
    }
    return this;
};

/**
 * Emit event
 *
 * @param {String} event Event to emit
 * @param {Object} data Event data
 * @return {Amoeba} self for chain execution
 */
Amoeba.prototype.emit = function() {
    var delimiter = ":";
    var path_delimiter = ".";
    if (this._parent) {
        this.root().emit(arguments[0], this._path, arguments[1]);
    } else {
        var event = arguments[0];
        var path = arguments[1];
        var data = arguments[2];

        EventEmitter.prototype.emit.call(this, event + delimiter + path, data, event, path);
        EventEmitter.prototype.emit.call(this, "*" + delimiter + path, data, event, path);

        var parts = path.split(path_delimiter);

        for (var i = parts.length; i >= 0; i--) {
            var res = parts.slice(0, i);
            res.push("*");

            EventEmitter.prototype.emit.call(this, event + delimiter + res.join(path_delimiter), data, event, path);
            EventEmitter.prototype.emit.call(this, "*" + delimiter + res.join(path_delimiter), data, event, path);
        }
    }
    return this;
};

/**
 * Invoke method
 * @param {String} method Method name
 * @param {Object} [params] Object or Array
 * @param {Function} [callback] Callback function for async methods
 * @return {Amoeba} self for chain execution
 */
Amoeba.prototype.invoke = function() {
    if (this._parent) {
        Array.prototype.unshift.call(arguments, this._path);
        return this.invoke.apply(this.root(), arguments);
    } else {
        var self = this;
        var context = {
            request: {
                path: arguments[0],
                method: arguments[1]
            }
        };
        //Delete method and path from arguments
        Array.prototype.splice.call(arguments, 0, 2);

        var callback = (typeof(arguments[arguments.length - 1]) == "function") ? Array.prototype.splice.call(arguments, arguments.length - 1, 1)[0] : null;

        context.request.arguments = Array.prototype.slice.call(arguments);
        
        //Init response if callback exists
        if (callback !== null) {
            context.response = {
                error: null,
                result: null
            };
        }

        //Chain of responsibility
        var chain = new Chain(self.handlers("before_invoke", context.request.path));
        chain.add(function(context, next) {
            var router = self.route(context.request.path);
            if (router) {
                if (router.invoke) {
                    router.invoke(context, next);
                } else {
                    throw new Error("Path \"" + context.request.path + "\" has no method invoke");
                }
            } else {
                throw new Error("Path \"" + context.request.path + "\" not found");
            }
        });
        chain.add(self.handlers("after_invoke", context.request.path));

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
        return this;
    }
};
/**
 * Add middleware logic
 * @param {String} type Type of handler. before_invoke | after_invoke | before_event
 * @param {Function} handler Handler
 * @return {Amoeba} self for chain execution
 */
Amoeba.prototype.use = function() {
    if (this._parent) {
        this.root().use(this._path, arguments[0], arguments[1]);
    } else {
        if (!this._handlers[arguments[1]]) {
            this._handlers[arguments[1]] = [];
        }
        this._handlers[arguments[1]].push({
            path: arguments[0],
            handler: arguments[2]
        });
    }
    return this;
};

Amoeba.prototype.handle = Amoeba.prototype.use;

/**
 * Find handlers by type or by type and path
 *
 * @param  {String} type Type of handle
 * @param  {String} path Used path
 * @return {Array}      All founded handlers
 */
Amoeba.prototype.handlers = function(type, path) {
    if (this._parent) {
        return this.root().handlers(type, this._path);
    } else {
        var res = [];
        var all = this._handlers[type] || [];
        for (var i = 0; i < all.length; i++) {
            if (typeof(path) == "undefined" || this.compare(all[i].path, path)) {
                res.push(all[i].handler);
            }
        }
        return res;
    }
};

Amoeba.prototype.compare = function(mask, path) {
    if (path == mask) {
        return true;
    }
    var parts = path.split('.');
    for (var i = parts.length; i >= 0; i--) {
        var res = parts.slice(0, i);
        res.push("*");
        if (res.join(".") == mask) {
            return true;
        }
    }
    return false;
};

Amoeba.prototype.route = function(path) {
    if (this._parent) {
        return this.root().route(path);
    } else {
        if (this._vacuols[path]) {
            return this._vacuols[path];
        }

        var parts = path.split('.');
        for (var i = parts.length; i >= 0; i--) {
            var res = parts.slice(0, i);
            res.push("*");
            if (this._vacuols[res.join(".")]) {
                return this._vacuols[res.join(".")];
            }
        }
        return null;
    }
};

module.exports = exports = Amoeba;
