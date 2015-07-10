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
    'horace.logLevel'          : 'debug'
    'horace.server.logLevel'   : 'warn'
    'horace.scanner.logLevel'  : 'debug'
    'horace.scan.serverstart'  : true,
    'horace.adapters.logLevel' : 'warn'
    'horace.db.logLevel'       : 'warn'
    'horace.webroot'           : 'dist'
    'horace.port'              : 8080
    'web.client.config'        : {}
    'horace.defaultAdapters'   : [
      './adapters/pdf-adapter.coffee'
    ]
    'horace.adapters'          : []
    'horace.folders'           : []
    'horace.db.location'       : dbLocation


module.exports = (key) -> $nconf.get key
