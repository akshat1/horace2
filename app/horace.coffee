$Path    = require 'path'
$Events  = require 'events'

$FSExtra = require 'fs-extra'
_        = require 'lodash'
$Winston = require 'winston'

$Config  = require './config.coffee'
$Utils   = require './utils.coffee'
$Scanner = require './scanner.coffee'


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
logger.info "watchedFolders:"
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
    logger.debug 'Scanning ended with'
    logger.debug args
    isScanning = false
    horace.emit Event.ScanStopped

  p.catch (err) ->
    logger.error 'Error scanning folders'
    logger.error err
    isScanning = false
    horace.emit Event.Error, err
  return




_.extend horace, 
  Event     : Event
  startScan : startScan

module.exports = horace
