###*
# Deals with all adapters. Sits between the Horace app and all adapters.
# @module adapter
###

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


adapters = []
adapterMap = {}
loadAdapters = () ->
  logger.info 'Loading adapters. . .'
  # Some adapters are default and will always be loaded by horace
  # While others are optional and may be added/removed by users.
  adapterPaths = $Config 'horace.defaultAdapters'
  adapterPaths = adapterPaths.concat $Config 'horace.adapters'
  logger.info "adapters to be loaded: \n\t#{adapterPaths.join '\n\t'}"

  adapters = _.map adapterPaths, (adapterPath) ->
    logger.info "adapterPath: #{adapterPath}"
    require adapterPath

  adapters = []
  adapterMap = {}
  for adapterPath in adapterPaths
    adapter = require adapterPath
    adapterId = adapter.getAdapterId()
    adapterMap[adapterId] = adapter
    adapters.push adapter

loadAdapters()


toArray = () -> adapters


getAdapterForBook = (book) -> adapterMap[book.adapterId]


getBook = (path) ->
  logger.info "getBook('#{path}')"
  adapters = toArray()
  logger.debug "#{adapters.length} adapters"
  getBookProxy = (adptr, index) -> adptr.getBook path
  $Utils.findPromise adapters, getBookProxy, _.identity


getBookOld = (path) ->
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
          logger.debug "** resolved #{path} with %o", book
          resolve book
  p0 = $Utils.conditionalRace promises, (x) -> !!x
  new Promise (resolve, reject) ->
    p0.catch (err) ->
      logger.error "Caught error for path: #{path}"
      if err
        logger.error 'Throwing error to scanner: ', err
        reject err

    p0.then (x) -> 
      logger.debug "Resolved for path: #{path}"
      resolve x


###*
 * Get a stream containing data for the indicated book in the target format.
 * @param {object} Book object
 * @param {string} target format
 * @return {Promise}
 * @resolves {Stream} Stream with the data for the book and format. May be simply piped to the http response
 * @rejects {Error}
###
getBookForDownload = (book, targetFormat) ->
  new Promise (resolve, reject) ->
    adapter = getAdapterForBook book
    unless adapter
      err = new Error "Adapter >#{book.adapterId}< not found."
      logger.error new Error "Adapter >#{book.adapterId}< not found."
      reject err

    resolve adapter.getBookForDownload book, targetFormat


module.exports =
  toArray            : toArray
  getBook            : getBook
  getBookForDownload : getBookForDownload
  getAdapterForBook  : getAdapterForBook

