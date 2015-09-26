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


_scanPath = (path) ->
  logger.debug "_scanPath(#{path})"
  new Promise (resolve, reject) ->
    $Adapters.getBook path
      .then (oBook) ->
        logger.debug "got book? #{!oBook}", oBook
        if oBook
          logger.debug 'resolve with oBook'
          resolve $DB.saveBook oBook

        else
          logger.debug 'Check if path is a directory'
          $FS.stat path, (statErr, oStat) ->
            # istanbul ignore if 
            if statErr
              logger.error "Error stating path #{path}", statErr

            else
              logger.debug "is it a directory then? #{oStat.isDirectory()}"
              if oStat.isDirectory()
                logger.debug 'it is a directory. read it'
                $FS.readdir path, (readdirErr, files) ->
                  if readdirErr
                    logger.error 'error doing readdir', readdirErr
                    reject readdirErr

                  else
                    logger.debug "We got #{files.length} files"
                    p = Promise.all _.map files, (f) ->
                      _scanPath $Path.join path, f

                    p.then (res) ->
                      resolve res

                    p.catch (err0) ->
                      logger.error '_scanPath failed!'
                      reject err0

              else
                resolve null

      .catch (adapterErr) ->
        logger.error "adapterErr for path #{path}", adapterErr
        # We don't break when we get an error about a file.


scanPath = (path) -> 
  _scanPath path


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
    $Utils.forEachPromise paths, scanPath
      .then () ->
        _master.emit IPCEvent.SCANNER_SCANSTOPPED

      .catch (err) ->
        _master.emit IPCEvent.ERROR_OCCURRED, 
          error: err

        _master.emit IPCEvent.SCANNER_SCANSTOPPED
    ###

  

# ---------- ---------- ---------- ---------- ---------- ---------- 

###
module.exports =
  scanPath : scanPath
###
