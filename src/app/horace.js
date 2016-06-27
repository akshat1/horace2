'use strict';
/**
 * @module horace
 */

const Path = require('path');
const Events = require('events');
const FS = require('fs');
const _ = require('lodash');
const Winston = require('winston');
const Book = require('./book.js');
const Config = require('./config.js');
const DB = require('./db.js');
const Adapter = require('./adapter.js');
const {Server: ServerEvents} = require('./events');

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
            resolve({
              tmpFilePath: tmpFilePath,
              title: book.title
            });
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


function setScanningForBooks(bool) {
  _isScanning = bool;
}


function getDistinctBookAttribute(columnName, query) {
  return DB.getDistinctBookAttribute(columnName, query);
}


function hideBook(bookId) {
  return DB.hideBook(parseInt(bookId));
}


function unHideAllBooks() {
  return DB.unHideAllBooks();
}


function updateBook(book) {
  return DB.saveBook(Book.clone(book));
}


var Horace = new Events.EventEmitter();
_.extend(Horace, {
  _emit                    : Horace.emit.bind(Horace),
  startScan                : startScan,
  getBooks                 : getBooks,
  getBook                  : getBook,
  updateBook               : updateBook,
  requestDownload          : requestDownload,
  isScanningForBooks       : isScanningForBooks,
  setScanningForBooks      : setScanningForBooks,
  getDistinctBookAttribute : getDistinctBookAttribute,
  hideBook                 : hideBook,
  unHideAllBooks           : unHideAllBooks
});


module.exports = Horace;
