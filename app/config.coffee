###*
# @module config
###

$nconf = require 'nconf'
$Path  = require 'path'

configFilePath = $Path.join process.cwd(), 'config.json'
dbLocation = $Path.join process.cwd(), 'db'

# See https://github.com/indexzero/nconf
$nconf
  .argv()
  .env()
  .file
    file: configFilePath
  .defaults
    'horace.rebuildClientAtStartup' : false
    'horace.tmpDirPath'        : 'tmp'
    'horace.urlSubDir'         : '/'
    'horace.logLevel'          : 'info'
    'horace.server.logLevel'   : 'warn'
    'horace.scanner.logLevel'  : 'warn'
    'horace.scan.serverstart'  : true,
    'horace.adapters.logLevel' : 'warn'
    'horace.db.logLevel'       : 'warn'
    'horace.webroot'           : 'dist'
    'horace.port'              : 8080
    'web.client.config'        : {}
    'horace.defaultAdapters'   : [
      './adapters/dli-adapter.coffee',
      './adapters/pdf-adapter.coffee'
    ]
    'horace.adapters'          : []
    'horace.folders'           : []
    'horace.db.location'       : dbLocation

###*
# @param {string} key
# @returns {Object|string}
###
module.exports = (key) -> $nconf.get key
