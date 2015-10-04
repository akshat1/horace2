/**
 * @module scanner
 */
var $Adapters, $Config, $DB, $FS, $IPC, $IPCUtils, $Path, $Utils, $Winston, IPCEvent, _, _getChildren, _scanChildren, _scanPath, _scanSequentially, logLevel, logger;

$IPC = require('node-ipc');

$Path = require('path');

$FS = require('graceful-fs');

$Winston = require('winston');

_ = require('lodash');

$IPCUtils = require('./ipc.js');

$Config = require('./config.js');

$Adapters = require('./adapter.js');

$DB = require('./db.js');

$Utils = require('./utils.js');

IPCEvent = $IPCUtils.Event;

logLevel = $Config('horace.scanner.logLevel');

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: logLevel
    }), new $Winston.transports.File({
      filename: 'horace-scanner.log'
    })
  ]
});


/**
 * if path is a directory then contents of the directory, else empty array
 * @path {string} path
 * @return {promise}
 * @resolves {Array} - Array of paths within path. Already joined with path
 */

_getChildren = function(path) {
  return new Promise(function(resolve, reject) {
    return $FS.stat(path, function(statErr, stat) {
      if (statErr) {
        return reject(statErr);
      } else {
        if (stat.isDirectory()) {
          return $FS.readdir(path, function(readdirErr, files) {
            if (files) {
              return resolve(files.map(function(f) {
                return $Path.join(path, f);
              }));
            } else {
              return resolve();
            }
          });
        } else {
          return resolve([]);
        }
      }
    });
  });
};

_scanChildren = function(path) {
  return _getChildren(path).then(_scanSequentially);
};

_scanPath = function(path) {
  logger.info("_scanPath(" + path + ")");
  return $Adapters.getBook(path).then(function(oBook) {
    if (oBook) {
      logger.info('Save this book');
      return $DB.saveBook(oBook);
    } else {
      logger.info('Scan children');
      return _scanChildren(path);
    }
  });
};

_scanSequentially = function(paths) {
  logger.info("_scanSequentially([" + (paths.join(',')) + "])");
  return $Utils.forEachPromise(paths, _scanPath);
};

$IPC.config.id = $IPCUtils.ID.SCANNER;

$IPC.config.silent = true;

$IPC.config.retry = 1000;

$IPC.connectTo($IPCUtils.ID.HORACE, function() {
  var _master;
  logger.info('Scanner connecting to master');
  _master = $IPC.of[$IPCUtils.ID.HORACE];
  _master.on('connect', function() {
    logger.info('Scanner connected to master');
    return _master.emit(IPCEvent.HELLOFROM_SCANNER);
  });
  _master.on('disconnect', function() {
    return logger.info('Scanner disconnected from master');
  });
  return _master.on(IPCEvent.SCANNER_DOSCAN, function(data) {
    var paths;
    paths = data.paths;
    logger.info('MASTER WANTS THE SCANNER TO START SCANNING ON :', paths);
    _master.emit(IPCEvent.SCANNER_SCANSTARTED);
    return _scanSequentially(paths).then(function() {
      logger.info('Done scanning all paths');
      return _master.emit(IPCEvent.SCANNER_SCANSTOPPED);
    })["catch"](function(err) {
      logger.error('Error scanning all paths. Going to emit error');
      logger.error(err);
      _master.emit(IPCEvent.ERROR_OCCURRED, {
        error: err
      });
      return _master.emit(IPCEvent.SCANNER_SCANSTOPPED);
    });
  });
});


/*
module.exports =
  _scanSequentially : _scanSequentially
 */