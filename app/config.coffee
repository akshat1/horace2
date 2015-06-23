nconf = require 'nconf'
Path  = require 'path'

configFilePath = Path.join process.cwd(), "config.json"

# See https://github.com/indexzero/nconf
nconf
  .argv()
  .env()
  .file
    file: configFilePath
  .defaults
    'horace.tmpDirPath' : 'tmp'
    'horace.urlSubDir'  : '/'
    'horace.loglevel'   : 'info'
    'horace.webroot'    : 'dist'
    'horace.port'       : 8080
    'web.client.config' : {}


module.exports = (key) -> nconf.get key
