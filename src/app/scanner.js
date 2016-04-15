'use strict';
/**
 * @module scanner
 */
var IPC = require('node-ipc');
var Path = require('path');
var FS = require('graceful-fs');
var Winston = require('winston');
var IPCEvents = require('./events.js').IPC;
var IPCUtils = require('./ipc.js');
var Config = require('./config.js');
var Adapters = require('./adapter.js');
var DB = require('./db.js');
var Utils = require('./utils.js');
const logLevel = Config('horace.scanner.logLevel');
const logger   = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: logLevel
    }), new Winston.transports.File({
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
function _getChildren(path) {
  return new Promise(function(resolve, reject) {
    FS.stat(path, function(statErr, stat) {
      if (statErr) {
        reject(statErr);
      } else {
        if (stat.isDirectory()) {
          FS.readdir(path, function(readdirErr, files) {
            if (files) {
              resolve(files.map(function(f) {
                return Path.join(path, f);
              }));
            } else {
              resolve();
            }
          }); //FS.readdir
        } else {
          resolve([]);
        }
      }
    });
  });
}


function _scanChildren(path) {
  return _getChildren(path).then(_scanSequentially);
}


function _scanPath(path) {
  logger.info(`_scanPath(${path})`);
  if(!path){
    return;
  }
  return Adapters.getBook(path)
    .then(function(oBook) {
      if (oBook) {
        logger.info('Save this book');
        return DB.saveBook(oBook);
      } else {
        logger.info('Scan children');
        return _scanChildren(path);
      }
    });
}


function _scanSequentially(paths) {
  logger.info(`_scanSequentially([${paths.join(',')}])`);
  return Utils.forEachPromise(paths, _scanPath);
}


// ----------------- Start IPC ---------------------
IPC.config.id     = IPCUtils.ID.SCANNER;
IPC.config.silent = true;
IPC.config.retry  = 1000;

IPC.connectTo(IPCUtils.ID.HORACE, function() {
  logger.info('Scanner connecting to master');
  var _master = IPC.of[IPCUtils.ID.HORACE];
  _master.on('connect', function() {
    logger.info('Scanner connected to master');
    _master.emit(IPCEvents.HELLOFROM_SCANNER);
  });
  _master.on('disconnect', function() {
    logger.info('Scanner disconnected from master');
  });
  _master.on(IPCEvents.SCANNER_DOSCAN, function(data) {
    let paths = data.paths;
    logger.info('MASTER WANTS THE SCANNER TO START SCANNING ON :', paths);
    _master.emit(IPCEvents.SCANNER_SCANSTARTED);
    return _scanSequentially(paths)
      .then(function() {
        logger.info('Done scanning all paths');
        return _master.emit(IPCEvents.SCANNER_SCANSTOPPED);
      }).catch(function(err) {
        logger.error('Error scanning all paths. Going to emit error');
        logger.error(err);
        _master.emit(IPCEvents.ERROR_OCCURRED, {
          error: err
        });
        return _master.emit(IPCEvents.SCANNER_SCANSTOPPED);
      });
  });
});
