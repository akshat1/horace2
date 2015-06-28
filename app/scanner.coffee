$Path    = require 'path'
$FS      = require 'graceful-fs'
$Winston = require 'winston'
_        = require 'lodash'

$Config   = require './config.coffee'
$Adapters = require './adapter.coffee'
$DB       = require './db.coffee'


logLevel = $Config 'horace.scanner.logLevel'
logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: logLevel
      }),
    new $Winston.transports.File({
      filename: 'horace-scanner.log'
      })
  ]


scanPath = (path) ->
  logger.info "scanPath(#{path})"
  p = new Promise (resolve, reject) ->
    onFileListReceived = (error, files) ->
      logger.info 'onFileListReceived(...)'
      if error
        logger.error "Error fetching file listing for >#{path}<"
        reject error
      else
        logger.info "Scanning #{files.length} files"
        promises = _.map files, (f) ->
          p1 = new Promise (resolve, reject) ->
            newPath = $Path.join path, f
            getBookPromise = $Adapters.getBook newPath
            getBookPromise
              .catch (err) -> reject err
              .then (book) ->
                logger.info 'Save book'
                resolve $DB.saveBook book
          p1
        resolve Promise.all promises

    $Adapters.getBook path
      .catch (err) -> 
        logger.error "Got an error from the adapter"
        logger.error err
        reject err
      .then (book) ->
        if book
          # got a book. no need to do anything else.
          logger.info 'Received book from the adapter'
          resolve book
        else
          logger.info 'Received no book. Get stats'
          # no book. check if this was a directory. If so, scan the directory.
          onStatReceived = (error, stat) ->
            logger.info 'onStatReceived(...)'
            if error
              logger.error "Error obtaining stats for the file >#{path}<"
              reject error
            else if stat.isDirectory()
              logger.info 'is a directory. Delve into it.'
              # path is a directory, and we must examine each file in it.
              $FS.readdir path, onFileListReceived
            else
              logger.info "No adapters identify #{path}"
              # path is a file, but we have no adapters that may identify it.
              resolve null

          $FS.stat path, onStatReceived

module.exports =
  scanPath : scanPath
