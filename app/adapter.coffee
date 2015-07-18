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


toArray = () -> adapters


getAdapterForBook = (book) -> adapterMap[book.adapterId]


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

