'use strict';


/* istanbul ignore next */
var NConf = require('nconf');
/* istanbul ignore next */
var Path = require('path');

/**
 * @module config
 */

/* istanbul ignore next */
(function() {
  var configFilePath = Path.join(process.cwd(), 'config.json');
  var dbLocation = Path.join(process.cwd(), 'db');

  NConf.argv().env().file({
    file: configFilePath
  }).defaults({
    'horace.rebuildClientAtStartup' : false,
    'horace.tmpDirPath'             : 'tmp',
    'horace.urlSubDir'              : '/',
    'horace.logLevel'               : 'info',
    'horace.server.logLevel'        : 'warn',
    'horace.scanner.logLevel'       : 'warn',
    'horace.scan.serverstart'       : true,
    'horace.adapters.logLevel'      : 'warn',
    'horace.db.logLevel'            : 'warn',
    'horace.webroot'                : 'dist',
    'horace.port'                   : 8080,
    'web.client.config'             : {},
    'horace.defaultAdapters'        : [
      './adapters/dli-adapter.js',
      './adapters/txt-adapter.js',
      './adapters/pdf-adapter.js'
    ],
    'horace.adapters'               : [],
    'horace.folders'                : [],
    'horace.db.location'            : dbLocation
  });
})();

/**
 * @param {string} key
 * @returns {Object|string}
 */
/* istanbul ignore next */
module.exports = NConf.get.bind(NConf);
