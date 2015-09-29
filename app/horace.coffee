###*
# @module horace
###

$Path   = require 'path'
$Events = require 'events'
$FS     = require 'fs'

$IPC          = require 'node-ipc'
$ChildProcess = require 'child_process'
$FSExtra      = require 'fs-extra'
_             = require 'lodash'
$Winston      = require 'winston'

$Config   = require './config.coffee'
$Utils    = require './utils.coffee'
$IPCUtils = require './ipc.coffee'
#$Scanner = require './scanner.coffee'
$DB       = require './db.coffee'
$Adapter  = require './adapter.coffee'


IPCEvent = $IPCUtils.Event

Event = 
  ScanStarted : 'Horace.ScanStarted'
  ScanStopped : 'Horace.ScanEnded'
  Error       : 'Horace.ErrorOccurred'


logLevel = $Config 'horace.logLevel'
logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({level: logLevel}),
    new $Winston.transports.File({filename: 'horace.log'})
  ]


watchedFolders = $Config 'horace.folders'
tmpFolderPath = $Path.join process.cwd(), $Config 'horace.tmpDirPath'
logger.info 'watchedFolders:'
logger.info watchedFolders
horace = new $Events.EventEmitter()


_isScanning = false
startScan = () ->
  logger.info 'startScanning'
  new Promise (resolve, reject) ->
    try
      logger.info 'broadcast event : ', IPCEvent.SCANNER_DOSCAN
      $IPC.server.broadcast IPCEvent.SCANNER_DOSCAN, 
        paths: watchedFolders
      logger.info 'done'
      resolve()

    catch err
      reject err


getBooks = (opts) ->
  logger.info 'getBooks'
  $DB.getBooks opts


getBook = (id) ->
  $DB.getBook id


requestDownload = (id) ->
  new Promise (resolve, reject) ->
    getBook id
      .then (book) ->
        logger.info 'Download >>> ', book
        tmpFilePath = $Path.join tmpFolderPath, "id_#{Date.now()}_#{$Path.basename(book.path)}"
        logger.debug 'write to tmp location: ', tmpFilePath
        $Adapter.getBookForDownload book
          .then (bookRStream) ->
            logger.debug 'Got book read stream', bookRStream
            try
              tmpFileWStream = $FS.createWriteStream tmpFilePath
              bookRStream.pipe tmpFileWStream
              bookRStream.on 'error', (rStreamError) ->
                logger.error 'Book read stream threw an error %o', err
                reject rStreamError

              bookRStream.on 'end', () ->
                logger.info 'Finished piping bookRStream'

              tmpFileWStream.on 'close', () ->
                logger.info 'Finished writing book to tmp location.'
                resolve tmpFilePath

            catch err2
              console.error 'Error occurred: ', err2
              if err2
                reject err2
                return
          .catch (err1) ->
            console.error "Error while preparing #{id} for download\n", err1
            reject err1

      .catch (err) ->
        console.err "Error fetching book: #{id}: ", err
        reject err




# - Launch IPC Server
$IPC.config.id     = $IPCUtils.ID.HORACE
$IPC.config.silent = true
$IPC.config.retry  = 1500

_ipcServer = () ->
  $IPC.server.on IPCEvent.HELLOFROM_SCANNER, (data, socket) ->
    if $Config 'horace.scan.serverstart'
      logger.info 'horace.scan.serverstart set to true. Scanning now.'
      startScan()


  $IPC.server.on IPCEvent.ERROR_OCCURRED, (data, socket) ->
    # data should have a .error property
    logger.error 'Somebody had an error', data
    console.error data


  $IPC.server.on IPCEvent.SCANNER_SCANSTARTED, (data, socket) ->
    # We completely ignore data
    _isScanning = true


  $IPC.server.on IPCEvent.SCANNER_SCANSTOPPED, (data, socket) ->
    logger.info 'Scaning Finished'
    # We completely ignore data
    _isScanning = false
    horace.emit Event.ScanStopped
    getBook()


$IPC.serve _ipcServer
$IPC.server.define.listen[IPCEvent.ERROR_OCCURRED]      = 'Some error occurred'
$IPC.server.define.listen[IPCEvent.HELLOFROM_SCANNER]   = 'Hello from scanner'
$IPC.server.define.listen[IPCEvent.SCANNER_SCANSTARTED] = 'The scanner has started scanning'
$IPC.server.define.listen[IPCEvent.SCANNER_SCANSTOPPED] = 'The scanner has stopped scanning'

$IPC.server.start()



# -------------------  ------------------- -------------------  -------------------
# Start child processes
$ChildProcess.fork './app/scanner.coffee'

_.extend horace, 
  Event           : Event
  startScan       : startScan
  getBooks        : getBooks
  requestDownload : requestDownload

module.exports = horace
