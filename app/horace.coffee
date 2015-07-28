$Path   = require 'path'
$Events = require 'events'
$FS     = require 'fs'

$FSExtra = require 'fs-extra'
_        = require 'lodash'
$Winston = require 'winston'

$Config  = require './config.coffee'
$Utils   = require './utils.coffee'
$Scanner = require './scanner.coffee'
$DB      = require './db.coffee'
$Adapter = require './adapter.coffee'


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


isScanning = false
startScan = () ->
  return if isScanning
  logger.info 'Horace.startScan'
  isScanning = true
  horace.emit Event.ScanStarted
  p = new Promise (resolve, reject) ->
    promises = _.map watchedFolders, (folder) -> 
      logger.debug "Scan #{folder}"
      $Scanner.scanPath folder
    resolve Promise.all promises

  p.then (args) ->
    logger.info 'Scanning Finished'
    isScanning = false
    horace.emit Event.ScanStopped

  p.catch (err) ->
    logger.error 'Error scanning folders. Stop.'
    logger.error err
    isScanning = false
    horace.emit Event.Error, err
  return


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
        $Adapter.getBookForDownload book, 'PDF'
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



# -------------------  ------------------- -------------------  -------------------
if $Config 'horace.scan.serverstart'
  logger.info 'horace.scan.serverstart set to true. Scanning now.'
  startScan()
else
  logger.info 'horace.scan.serverstart set to false.'

_.extend horace, 
  Event           : Event
  startScan       : startScan
  getBooks        : getBooks
  requestDownload : requestDownload

module.exports = horace
