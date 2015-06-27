config  = require './config.coffee'
Winston = require 'Winston'
_       = require 'lodash'

logLevel = config.get 'horace.adapters.logLevel'
logger = new Winston.Logger
  transports: [
    new Winston.transports.Console({level: logLevel}),
    new Winston.transports.File({filename: 'horace-adapters.log'})
  ]


logger.info 'Loading adapters. . .'
adapterPaths = config.get 'horace.adapters'
logger.info "adapters to be loaded: \n\t#{adapterPaths.join '\n\t'}"

adapters = _.map adapterPaths, (adapterPath) ->
  logger.info "adapterPath: #{adapterPath}"
  require adapterPath


toArray = () -> adapters


getBook = (path) ->
  adapters = toAdapters()
  logger.info "getBook('#{path}')"
  logger.info "#{adapters.length} adapters"
  promises = _.map adapters, (a) -> a.getBook path
  logger.info "Yielded #{promises.length} promises"


module.exports =
  toArray : toArray
  getBook : getBook
