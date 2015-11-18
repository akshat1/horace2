'use strict';
/**
 * @module horace
 */

import Path from 'path';
import Events from 'events';
import FS from 'fs';
import IPC from 'node-ipc';
import ChildProcess from 'child_process';
import _ from 'lodash';
import Winston from 'winston';

import Config from './config.js';
import * as IPCUtils from './ipc.js';
import * as DB from './db.js';
import * as Adapter from './adapter.js';
import HoraceEvents from './events.js';

const IPCEvents = HoraceEvents.IPC;
const ServerEvents = HoraceEvents.Server;
const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: Config('horace.logLevel')
    }), new Winston.transports.File({
      filename: 'horace.log'
    })
  ]
});

const tmpFolderPath = Path.join(process.cwd(), Config('horace.tmpDirPath'));
const watchedFolders = Config('horace.folders');
var _isScanning = false;


logger.info('watchedFolders:');
logger.info(watchedFolders);


function startScan() {
  logger.info('startScanning');
  return new Promise(function(resolve, reject) {
    try {
      logger.info('broadcast event : ', IPCEvents.SCANNER_DOSCAN);
      IPC.server.broadcast(IPCEvents.SCANNER_DOSCAN, {
        paths: watchedFolders
      });
      logger.info('done');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}


function getBooks(opts) {
  logger.info('getBooks');
  return DB.getBooks(opts);
}


function getBook(id) {
  logger.info(`getBook(${id})`);
  return DB.getBook(id);
}


function requestDownload(id) {
  return new Promise(function(resolve, reject) {
    return getBook(id).then(function(book) {
      logger.info('Download >>> ', book);
      let tmpFilePath = Path.join(tmpFolderPath, Path.basename(book.path));
      logger.debug('write to tmp location: ', tmpFilePath);
      Adapter.getBookForDownload(book).then(function(bookRStream) {
        logger.debug('Got book read stream', bookRStream);
        try {
          let tmpFileWStream = FS.createWriteStream(tmpFilePath);
          bookRStream.pipe(tmpFileWStream);
          bookRStream.on('error', function(rStreamError) {
            logger.error('Book read stream threw an error %o', rStreamError);
            reject(rStreamError);
          });

          bookRStream.on('end', function() {
            logger.info('Finished piping bookRStream');
          });

          tmpFileWStream.on('close', function() {
            logger.info('Finished writing book to tmp location.');
            resolve(tmpFilePath);
          });

        } catch (err2) {
          console.error('Error occurred: ', err2);
          if (err2) {
            reject(err2);
          }
        }

      }).catch(function(err1) {
        console.error(`Error while preparing ${id} for download\n`, err1);
        return reject(err1);
      });

    }).catch(function(err) {
      console.err(`Error fetching book: ${id} `, err);
      return reject(err);
    });
  });
}


function isScanningForBooks() {
  return _isScanning;
}


function getDistinctBookAttribute(columnName, query) {
  return DB.getDistinctBookAttribute(columnName, query);
}


var Horace = new Events.EventEmitter();
_.extend(Horace, {
  startScan                : startScan,
  getBooks                 : getBooks,
  getBook                  : getBook,
  requestDownload          : requestDownload,
  isScanningForBooks       : isScanningForBooks,
  getDistinctBookAttribute : getDistinctBookAttribute
});
export default Horace;



// ------------------------------- IPC

IPC.config.id     = IPCUtils.ID.HORACE;
IPC.config.silent = true;
IPC.config.retry  = 1500;

function _ipcServer() {
  IPC.server.on(IPCEvents.HELLOFROM_SCANNER, function() { //data, socket
    if (Config('horace.scan.serverstart')) {
      logger.info('horace.scan.serverstart set to true. Scanning now.');
      return startScan();
    }
  });

  IPC.server.on(IPCEvents.ERROR_OCCURRED, function(data) {
    logger.error('Somebody had an error', data);
    return console.error(data);
  });

  IPC.server.on(IPCEvents.SCANNER_SCANSTARTED, function() {
    _isScanning = true;
    Horace.emit(ServerEvents.SCANNER_SCANSTARTED);
  });

  return IPC.server.on(IPCEvents.SCANNER_SCANSTOPPED, function() {
    logger.info('Scaning Finished');
    _isScanning = false;
    getBook();
    Horace.emit(ServerEvents.SCANNER_SCANSTOPPED);
  });
}


IPC.serve(_ipcServer);
IPC.server.define.listen[IPCEvents.ERROR_OCCURRED] = 'Some error occurred';
IPC.server.define.listen[IPCEvents.HELLOFROM_SCANNER] = 'Hello from scanner';
IPC.server.define.listen[IPCEvents.SCANNER_SCANSTARTED] = 'The scanner has started scanning';
IPC.server.define.listen[IPCEvents.SCANNER_SCANSTOPPED] = 'The scanner has stopped scanning';
IPC.server.start();
ChildProcess.fork('./app/scanner.js');
