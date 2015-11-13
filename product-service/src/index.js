var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

var pkgjson = require('./package.json');
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose-q')();
var winston = require('winston');
//winston.add(winston.transports.File, { filename: pkgjson.name + '.log' });
var Etcd = require('node-etcd');
var etcd = new Etcd(nconf.get('etcd:host'), nconf.get('etcd:port'));
var uuid = require('node-uuid');
var serviceId = uuid.v4();
var os = require('os');
var hostname = os.hostname();

function getServiceInfo() {
  return {
    hostname: hostname,
    port: nconf.get('PORT'),
    pid: process.pid,
    name: pkgjson.name,
    version: pkgjson.version
  };
}

// Connect to mongodb
var dbOpts = { server: { socketOptions: { keepAlive: 1 } } };
var dbString = nconf.get('database:host') + ':' +
               nconf.get('database:port') + '/' +
               nconf.get('database:name');
mongoose.connect(dbString, dbOpts);
mongoose.connection.on('error', function(err) {
  winston.info('MongoDB: Connection error: ' + err);
  process.exit(-1);
});

// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Setup routes
app.use(require('./routes'));

app.get('/status', function(req, res) {
  var dateStr = new Date().toString();
  winston.info('%s get status', dateStr);
  res.json(getServiceInfo());
});

app.use((err, req, res, next) => {
  winston.info(err.message);
  res.sendStatus(err.status || 500);
});

app.listen(nconf.get('PORT'));
winston.info('%s listening on port %d', pkgjson.name, nconf.get('PORT'));

// Register service in etcd
function etcdRegister() {
  var p = path.join('/', 'services', 'products', serviceId);
  etcd.set(p, JSON.stringify(getServiceInfo()), { ttl: 10 });
  setTimeout(etcdRegister, 5000); // setInterval ?
  return p;
}
winston.info('Registered with etcd as ' + etcdRegister());
