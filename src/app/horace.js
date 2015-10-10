/**
 * @module horace
 */
var $Adapter, $ChildProcess, $Config, $DB, $Events, $FS, $FSExtra, $IPC, $IPCUtils, $Path, $Utils, $Winston, Event, IPCEvent, _, _ipcServer, _isScanning, getBook, getBooks, horace, logLevel, logger, requestDownload, startScan, tmpFolderPath, watchedFolders;

$Path = require('path');

$Events = require('events');

$FS = require('fs');

$IPC = require('node-ipc');

$ChildProcess = require('child_process');

$FSExtra = require('fs-extra');

_ = require('lodash');

$Winston = require('winston');

$Config = require('./config.js');

$Utils = require('./utils.js');

$IPCUtils = require('./ipc.js');

$DB = require('./db.js');

$Adapter = require('./adapter.js');

IPCEvent = $IPCUtils.Event;

Event = {
  ScanStarted: 'Horace.ScanStarted',
  ScanStopped: 'Horace.ScanEnded',
  Error: 'Horace.ErrorOccurred'
};

logLevel = $Config('horace.logLevel');

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: logLevel
    }), new $Winston.transports.File({
      filename: 'horace.log'
    })
  ]
});

watchedFolders = $Config('horace.folders');

tmpFolderPath = $Path.join(process.cwd(), $Config('horace.tmpDirPath'));

logger.info('watchedFolders:');

logger.info(watchedFolders);

horace = new $Events.EventEmitter();

_isScanning = false;

startScan = function() {
  logger.info('startScanning');
  return new Promise(function(resolve, reject) {
    var err;
    try {
      logger.info('broadcast event : ', IPCEvent.SCANNER_DOSCAN);
      $IPC.server.broadcast(IPCEvent.SCANNER_DOSCAN, {
        paths: watchedFolders
      });
      logger.info('done');
      return resolve();
    } catch (_error) {
      err = _error;
      return reject(err);
    }
  });
};

getBooks = function(opts) {
  logger.info('getBooks');
  return $DB.getBooks(opts);
};

getBook = function(id) {
  return $DB.getBook(id);
};

requestDownload = function(id) {
  return new Promise(function(resolve, reject) {
    return getBook(id).then(function(book) {
      var tmpFilePath;
      logger.info('Download >>> ', book);
      tmpFilePath = $Path.join(tmpFolderPath, "id_" + (Date.now()) + "_" + ($Path.basename(book.path)));
      logger.debug('write to tmp location: ', tmpFilePath);
      return $Adapter.getBookForDownload(book).then(function(bookRStream) {
        var err2, tmpFileWStream;
        logger.debug('Got book read stream', bookRStream);
        try {
          tmpFileWStream = $FS.createWriteStream(tmpFilePath);
          bookRStream.pipe(tmpFileWStream);
          bookRStream.on('error', function(rStreamError) {
            logger.error('Book read stream threw an error %o', err);
            return reject(rStreamError);
          });
          bookRStream.on('end', function() {
            return logger.info('Finished piping bookRStream');
          });
          return tmpFileWStream.on('close', function() {
            logger.info('Finished writing book to tmp location.');
            return resolve(tmpFilePath);
          });
        } catch (_error) {
          err2 = _error;
          console.error('Error occurred: ', err2);
          if (err2) {
            reject(err2);
          }
        }
      })["catch"](function(err1) {
        console.error("Error while preparing " + id + " for download\n", err1);
        return reject(err1);
      });
    })["catch"](function(err) {
      console.err("Error fetching book: " + id + ": ", err);
      return reject(err);
    });
  });
};

$IPC.config.id = $IPCUtils.ID.HORACE;

$IPC.config.silent = true;

$IPC.config.retry = 1500;

_ipcServer = function() {
  $IPC.server.on(IPCEvent.HELLOFROM_SCANNER, function(data, socket) {
    if ($Config('horace.scan.serverstart')) {
      logger.info('horace.scan.serverstart set to true. Scanning now.');
      return startScan();
    }
  });
  $IPC.server.on(IPCEvent.ERROR_OCCURRED, function(data, socket) {
    logger.error('Somebody had an error', data);
    return console.error(data);
  });
  $IPC.server.on(IPCEvent.SCANNER_SCANSTARTED, function(data, socket) {
    return _isScanning = true;
  });
  return $IPC.server.on(IPCEvent.SCANNER_SCANSTOPPED, function(data, socket) {
    logger.info('Scaning Finished');
    _isScanning = false;
    horace.emit(Event.ScanStopped);
    return getBook();
  });
};

$IPC.serve(_ipcServer);

$IPC.server.define.listen[IPCEvent.ERROR_OCCURRED] = 'Some error occurred';

$IPC.server.define.listen[IPCEvent.HELLOFROM_SCANNER] = 'Hello from scanner';

$IPC.server.define.listen[IPCEvent.SCANNER_SCANSTARTED] = 'The scanner has started scanning';

$IPC.server.define.listen[IPCEvent.SCANNER_SCANSTOPPED] = 'The scanner has stopped scanning';

$IPC.server.start();

$ChildProcess.fork('./app/scanner.js');

_.extend(horace, {
  Event: Event,
  startScan: startScan,
  getBooks: getBooks,
  requestDownload: requestDownload
});

module.exports = horace;