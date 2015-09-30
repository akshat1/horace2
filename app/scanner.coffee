###*
# @module scanner
###

$IPC     = require 'node-ipc'
$Path    = require 'path'
$FS      = require 'graceful-fs'
$Winston = require 'winston'
_        = require 'lodash'

$IPCUtils = require './ipc.coffee'
$Config   = require './config.coffee'
$Adapters = require './adapter.coffee'
$DB       = require './db.coffee'
$Utils    = require './utils.coffee'


IPCEvent = $IPCUtils.Event

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


# ---------- ---------- ---------- ---------- ---------- ---------- 
###*
# if path is a directory then contents of the directory, else empty array
# @path {string} path
# @return {promise}
# @resolves {Array} - Array of paths within path. Already joined with path
###
_getChildren = (path) ->
  new Promise (resolve, reject) ->
    $FS.stat path, (statErr, stat) ->
      if statErr
        reject statErr

      else
        if stat.isDirectory()
          $FS.readdir path, (readdirErr, files) ->
            if files
              resolve files.map (f) -> $Path.join path, f

            else
              resolve()

        else
          resolve []


_scanChildren = (path) ->
  _getChildren path
    .then _scanSequentially



_scanPath = (path) ->
  logger.info "_scanPath(#{path})"
  $Adapters.getBook path
    .then (oBook) ->
      if oBook
        logger.info 'Save this book'
        $DB.saveBook oBook

      else
        logger.info 'Scan children'
        _scanChildren path


_scanSequentially = (paths) ->
  logger.info "_scanSequentially([#{paths.join ','}])"
  $Utils.forEachPromise paths, _scanPath


$IPC.config.id     = $IPCUtils.ID.SCANNER
$IPC.config.silent = true
$IPC.config.retry  = 1000

$IPC.connectTo $IPCUtils.ID.HORACE, () ->
  logger.info 'Scanner connecting to master'
  _master = $IPC.of[$IPCUtils.ID.HORACE]
  _master.on 'connect', () ->
    logger.info 'Scanner connected to master'
    _master.emit IPCEvent.HELLOFROM_SCANNER


  _master.on 'disconnect', () ->
    logger.info 'Scanner disconnected from master'


  _master.on IPCEvent.SCANNER_DOSCAN, (data) ->
    paths = data.paths
    logger.info 'MASTER WANTS THE SCANNER TO START SCANNING ON :', paths
    _master.emit IPCEvent.SCANNER_SCANSTARTED
    _scanSequentially paths
      .then () ->
        logger.info 'Done scanning all paths' 
        _master.emit IPCEvent.SCANNER_SCANSTOPPED

      .catch (err) ->
        logger.error 'Error scanning all paths. Going to emit error'
        logger.error err
        _master.emit IPCEvent.ERROR_OCCURRED, 
          error: err

        _master.emit IPCEvent.SCANNER_SCANSTOPPED


# ---------- ---------- ---------- ---------- ---------- ---------- 

###
module.exports =
  _scanSequentially : _scanSequentially
###
