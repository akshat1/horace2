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

### ----
So scanning is going to be a two step process.
1. scanPath: We get a path, and we try $Adapters.getBook;
2. If somebody identified the path, then great and we store it.
3. Otherwise, check if this is a directory.
4. If this is a directory, then send it to scanInsideDirectory.
5. this is where we get the list of files and callscanPath for 
   each one (and repeat the process).
###
scanInsideDirectory = (path) ->
  logger.debug "scanInsideDirectory(#{path})"
  p = new Promise (resolve, reject) ->
    $FS.readdir path, (dirReadError, files) ->
      if dirReadError
        err = new Error "Error reading directory: #{path}", dirReadError
        console.error err
        logger.error err
        reject err

      else
        for f in files
          filePath = $Path.join path, f
          resolve scanPath filePath

  p


scanPath = (path, isSecondPassOfDirectory) ->
  logger.info "scanPath(#{path}, #{isSecondPassOfDirectory})"
  p = new Promise (resolve, reject) ->
    if isSecondPassOfDirectory
      logger.debug 'this is the second pass'
      # We already know path refers to a directory, and no adapters identified it.
      $FS.stat path, (err, stats) ->
        if err
          err = new Error "Getting stats for path: #{path}", err
          console.error err
          logger.error err
          reject err

        else
          if stats.isDirectory()
            logger.debug 'Yup this is a directory and we are descending into it.'
            resolve scanInsideDirectory path

          else
            logger.debug 'This isnt a directory. Nothing more to do with this.'
            resolve()

    else
      # First pass. Could be a directory, or a file. But we don't care.
      $Adapters.getBook path
        .then (oBook) ->
          if oBook
            logger.debug "We have a book object for #{path}"
            resolve $DB.saveBook oBook

          else
            logger.debug "Nobody identified #{path}. Call ourselves for another pass."
            resolve scanPath path, true

        .catch (adapterError) ->
          err = new Error "Adapter error for path #{path}", adapterError
          console.error err
          logger.error err
          reject err

  p




module.exports =
  scanPath : scanPath
