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
    'horace.logLevel'          : 'warn'
    'horace.server.logLevel'   : 'warn'
    'horace.scanner.logLevel'  : 'warn'
    'horace.adapters.logLevel' : 'warn'
    'horace.db.logLevel'       : 'warn'
    'horace.webroot'           : 'dist'
    'horace.port'              : 8080
    'web.client.config'        : {}
    'horace.adapters'          : [
      './adapters/dli-adapter.coffee'
      ]
    'horace.folders'           : []
    'horace.db.location'       : dbLocation


module.exports = (key) -> $nconf.get key
