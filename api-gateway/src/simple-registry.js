var http = require('request-promise-json');
var winston = require('winston');
var Q = require('q');

var SimpleRegistry = function() {
  // Using lookup like this:
  // serviceRegistry[serviceName][serviceInstanceKey]
  this.serviceRegistry = {};
};

module.exports = SimpleRegistry;

SimpleRegistry.prototype.list = function() {
  var serviceRegistry = this.serviceRegistry;
  return Object.keys(serviceRegistry)
    .map(function(serviceName) {
      return Object.keys(serviceRegistry[serviceName]).map(function(key) {
        return serviceRegistry[serviceName][key];
      });
    })
    .reduce(function (a, b) {
      return a.concat(b);
    });
};

SimpleRegistry.prototype.update = function(serviceName, services) {
  var serviceRegistry = this.serviceRegistry;
  serviceRegistry[serviceName] = {};
  services.forEach(function(service) {
    serviceRegistry[serviceName][service.key] = service;
  });
};

SimpleRegistry.prototype.getService = function(name) {
  var serviceRegistry = this.serviceRegistry;
  var keys = Object.keys(serviceRegistry[name]);
  var randomServiceKey = keys[Math.floor(Math.random() * keys.length)];
  var service = serviceRegistry[name][randomServiceKey];
  if (service !== undefined) {
    winston.info('getService %s using %s:%d', name, service.hostname, service.port);
  }
  return service;
};

function getServiceUrl(service) {
  return 'http://' + service.hostname + ':' + service.port;
}

function callService(service, path) {
  return http.request({
    method: 'GET',
    url: getServiceUrl(service) + path
  });
}

SimpleRegistry.prototype.invokeService = function(name, path) {
  var service = this.getService(name);
  if (service !== undefined) {

    return callService(service, path)
      .catch(function(err) {
        winston.info('%s service not responding', name);
        var d = Q.defer();
        d.reject({error: name + ' service not responding'});
        return d.promise;
      });

  } else {
    winston.info('%s service unavailable', name);
    var d = Q.defer();
    d.reject({error: name + ' service unavailable'});
    return d.promise;
  }
};

