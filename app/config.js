"use strict";
/**
 * @module config
 */
var $Path, $nconf, configFilePath, dbLocation;

$nconf = require('nconf');
$Path = require('path');

configFilePath = $Path.join(process.cwd(), 'config.json');
dbLocation = $Path.join(process.cwd(), 'db');

$nconf.argv().env().file({
  file: configFilePath
}).defaults({
  'horace.rebuildClientAtStartup': false,
  'horace.tmpDirPath': 'tmp',
  'horace.urlSubDir': '/',
  'horace.logLevel': 'info',
  'horace.server.logLevel': 'warn',
  'horace.scanner.logLevel': 'debug',
  'horace.scan.serverstart': true,
  'horace.adapters.logLevel': 'debug',
  'horace.db.logLevel': 'warn',
  'horace.webroot': 'dist',
  'horace.port': 8080,
  'web.client.config': {},
  'horace.defaultAdapters': ['./adapters/dli-adapter.js', './adapters/txt-adapter.js', './adapters/pdf-adapter.js'],
  'horace.adapters': [],
  'horace.folders': [],
  'horace.db.location': dbLocation
});

/**
 * @param {string} key
 * @returns {Object|string}
 */
module.exports = function (key) {
  return $nconf.get(key);
};