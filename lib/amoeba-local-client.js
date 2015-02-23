LocalClient = function(service) {
    this.service = service;
};
/**
 * Main point
 * @param  {String}   serviceName 
 * @param  {String}   method      [description]
 * @param  {Object}   data        [description]
 * @param  {Function} callback    [description]
 * @return
 */
LocalClient.prototype.invoke = function(serviceName, method, data, callback) {
    this.service[method].apply(this.service, [data, callback]);
};

module.exports = exports = LocalClient;