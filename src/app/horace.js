'use strict';
/**
 * @module horace
 */

import Path from 'path';
import Events from 'events';
import FS from 'fs';
import IPC from 'node-ipc';
import ChildProcess from 'child_process';
import FSExtra from 'fs-extra';
import _ from 'lodash';
import Winston from 'winston';

import Config from './config.js';
import * as Utils from './utils.js';
import * as IPCUtils from './ipc.js';
import IPCEvent from './ipc.js';
import * as DB from './db.js';
import * as Adapter from './adapter.js';


export const Event = {
  ScanStarted : 'Horace.ScanStarted',
  ScanStopped : 'Horace.ScanStopped',
  Error       : 'Horace.ErrorOccurred'
};

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
const horace = new Events.EventEmitter();
var _isScanning = false;


logger.info('watchedFolders:');
logger.info(watchedFolders);


export function startScan() {
  logger.info('startScanning');
  return new Promise(function(resolve, reject) {
    try {
      logger.info('broadcast event : ', IPCEvent.SCANNER_DOSCAN);
      IPC.server.broadcast(IPCEvent.SCANNER_DOSCAN, {
        paths: watchedFolders
      });
      logger.info('done');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};


export function getBooks(opts) {
  logger.info('getBooks');
  return DB.getBooks(opts);
};


export function getBook(id) {
  logger.info(`getBook(${id})`);
  return DB.getBook(id);
};


export function requestDownload(id) {
  return new Promise(function(resolve, reject) {
    return getBook(id).then(function(book) {
      logger.info('Download >>> ', book);
      let tmpFilePath = Path.join(tmpFolderPath, "id_" + (Date.now()) + "_" + (Path.basename(book.path)));
      logger.debug('write to tmp location: ', tmpFilePath);
      Adapter.getBookForDownload(book).then(function(bookRStream) {
        logger.debug('Got book read stream', bookRStream);
        try {
          let tmpFileWStream = FS.createWriteStream(tmpFilePath);
          bookRStream.pipe(tmpFileWStream);
          bookRStream.on('error', function(rStreamError) {
            logger.error('Book read stream threw an error %o', err);
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
        console.error("Error while preparing " + id + " for download\n", err1);
        return reject(err1);
      });

    }).catch(function(err) {
      console.err("Error fetching book: " + id + ": ", err);
      return reject(err);
    });
  });
};


// |--|----------------------------- IPC

IPC.config.id     = IPCUtils.ID.HORACE;
IPC.config.silent = true;
IPC.config.retry  = 1500;

function _ipcServer() {
  IPC.server.on(IPCEvent.HELLOFROM_SCANNER, function(data, socket) {
    if (Config('horace.scan.serverstart')) {
      logger.info('horace.scan.serverstart set to true. Scanning now.');
      return startScan();
    }
  });
  IPC.server.on(IPCEvent.ERROR_OCCURRED, function(data, socket) {
    logger.error('Somebody had an error', data);
    return console.error(data);
  });
  IPC.server.on(IPCEvent.SCANNER_SCANSTARTED, function(data, socket) {
    return _isScanning = true;
  });
  return IPC.server.on(IPCEvent.SCANNER_SCANSTOPPED, function(data, socket) {
    logger.info('Scaning Finished');
    _isScanning = false;
    horace.emit(Event.ScanStopped);
    return getBook();
  });
};


IPC.serve(_ipcServer);
IPC.server.define.listen[IPCEvent.ERROR_OCCURRED] = 'Some error occurred';
IPC.server.define.listen[IPCEvent.HELLOFROM_SCANNER] = 'Hello from scanner';
IPC.server.define.listen[IPCEvent.SCANNER_SCANSTARTED] = 'The scanner has started scanning';
IPC.server.define.listen[IPCEvent.SCANNER_SCANSTOPPED] = 'The scanner has stopped scanning';
IPC.server.start();
ChildProcess.fork('./app/scanner.js');
