var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

var pkgjson = require('./package.json');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var winston = require('winston');
//winston.add(winston.transports.File, { filename: pkgjson.name + '.log' });

var SimpleEtcd = require('./simple-etcd');
var simpleEtcd = new SimpleEtcd(nconf.get('etcd:host'), nconf.get('etcd:port'));

var SimpleRegistry = require('./simple-registry');
var serviceRegistry = new SimpleRegistry();

function discoverServices(serviceName) {
  simpleEtcd
  .discover(serviceName)
  .then(services => {
    serviceRegistry.update(serviceName, services);
    serviceRegistry.list().forEach(function(service) {
      winston.info('%s %s:%d', service.key, service.hostname, service.port);
    });
  });
}

function serviceWatcher() {
  discoverServices('products');
  setTimeout(serviceWatcher, 5000);
}

// Start discovering services
serviceWatcher();

// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/products', (req, res) => {
  serviceRegistry.invokeService('products', '/products')
  .then(products => res.json({ products: products }))
  .catch(err => res.json({ products: [] }));
});

app.get('/status', (req, res) => {
  serviceRegistry.invokeService('products', '/status')
  .then(status => res.json(status))
  .catch(err => res.json(err));
});

app.use((err, req, res, next) => {
  winston.info(err.message);
  res.sendStatus(err.status || 500);
});

app.listen(nconf.get('server:port'));
winston.info('%s listening on port %d', pkgjson.name, nconf.get('server:port'));
