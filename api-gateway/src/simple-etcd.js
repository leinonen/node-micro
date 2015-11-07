/**
 * Very simple etcd service discovery module
 */
var path = require('path');
var winston = require('winston');
var http = require('request-promise-json');

var SimpleEtcd = function(etcdHost, etcdPort) {
  this.etcdHost = etcdHost;
  this.etcdPort = etcdPort;
};

module.exports = SimpleEtcd;

function parseNode(node) {
  var service = JSON.parse(node.value);
  service.key = node.key;
  return service;
}

function handleResponse(response) {
  var nodes = response.node.nodes;
  if (nodes !== undefined) {
    return nodes.map(parseNode);
  } else {
    return [];
  }
}

function handleError(err) {
  winston.info(err);
  return [];
}

SimpleEtcd.prototype.discover = function(name) {
  if (name === undefined) {
    winston.info('You must provide a service name');
    process.exit(1);
  }
  var etcdUrl = 'http://' + this.etcdHost + ':' + this.etcdPort + '/v2/keys';

  return http.request({
    method: 'GET',
    url: etcdUrl + path.join('/', 'services', name)
  })
  .then(handleResponse)
  .catch(handleError);
};

