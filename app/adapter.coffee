$Config  = require './config.coffee'
$Winston = require 'Winston'
_       = require 'lodash'

$Utils = require './utils.coffee'

logLevel = $Config 'horace.adapters.logLevel'
logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({level: logLevel}),
    new $Winston.transports.File({filename: 'horace-adapters.log'})
  ]


logger.info 'Loading adapters. . .'
adapterPaths = $Config 'horace.adapters'
logger.info "adapters to be loaded: \n\t#{adapterPaths.join '\n\t'}"

adapters = _.map adapterPaths, (adapterPath) ->
  logger.info "adapterPath: #{adapterPath}"
  require adapterPath


toArray = () -> adapters


getBook = (path) ->
  adapters = toArray()
  logger.info "getBook('#{path}')"
  logger.debug "#{adapters.length} adapters"
  promises = _.map adapters, (a) ->
    new Promise (resolve, reject) ->
      a.getBook path
        .catch (err) ->
          logger.error "Adapter #{a.getAdapterId()} threw an error %o", err
          reject err

        .then (book) ->
          logger.debug 'resolved with %o', book
          resolve book
  p = $Utils.conditionalRace promises, (x) -> !!x
  p


module.exports =
  toArray : toArray
  getBook : getBook
