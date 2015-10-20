'use strict';

/**
 * @module db
 */

import MongoDB from 'mongodb';
import Winston from 'winston';
import _ from 'lodash';

import FSExtra from 'fs-extra';
import Config from './config.js';
import Sorting from './sorting.js';
import Book from './book.js';

const Collection = {
  Books: 'horace-books'
};

const logLevel = Config('horace.db.logLevel');
const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: logLevel
    }), new Winston.transports.File({
      filename: 'horace-db.log'
    })
  ]
});


/*
// Keep tingoDB code around for now
dbLocation = $Config 'horace.db.location'
throw new Error 'dbLocation not defined' unless dbLocation
logger.info "Ensure #{dbLocation}"
$FSExtra.ensureDir dbLocation

logger.info 'Create db instance'
Engine = $Tingo()
database = new Engine.Db dbLocation, {}
*/

const client = MongoDB.MongoClient;
const url = 'mongodb://localhost:27017/horace?maxPoolSize=10';

var _isConnected = false;
var collectionBooks = null;



var ConnectPromise = new Promise(function(resolve, reject) {
  client.connect(url, function(connectErr, db) {
    if(connectErr) {
      reject(connectErr);
    } else {
      collectionBooks = db.collection('books');
      resolve();
    }
  });
});


export function saveBook(book) {
  logger.info('saveBook(%o)', book.id);
  return ConnectPromise.then(function() {
    var p;
    p = new Promise(function(resolve, reject) {
      var handleUpsert;
      handleUpsert = function(err) {
        if (err) {
          logger.error('Upsert error %o', err);
          return reject(err);
        } else {
          logger.info("Saved book " + book.id);
          return resolve();
        }
      };
      logger.debug('run upsert');
      return collectionBooks.update({
        id: book.id
      }, book, {
        upsert: true
      }, handleUpsert);
    });
    return p;
  });
};


export function getBooks(opts) {
  return ConnectPromise.then(function(){
    return new Promise(function(resolve, reject){
      var defaults = {
        sortColumn: 'title',
        sortAscending: true
      };
      var sortOpts = {};
      opts.sortAscending = `${opts.sortAscending}`.toLowerCase() === 'true'
      sortOpts[opts.sortColumn] = opts.sortAscending ? 1 : -1;
      opts = _.assign(defaults, opts);
      var filter = Book.mongoFilter(opts.filter);
      console.log('filter: ', filter);
      var cur = collectionBooks.find(filter).sort(sortOpts);
      cur.toArray(function(curErr, books) {
        if(curErr){
          logger.error('Error converting to array', curErr);
          return reject(curErr);
        } else {
          var currentPage = parseInt(opts.currentPage) || 0;
          var pageSize = parseInt(opts.pageSize) || 25;
          var from = currentPage * pageSize;
          var to = from + pageSize;
          var maxPages = books.length ? Math.ceil(books.length / pageSize) : 0;
          books = books.slice(from, to);
          resolve({
            books         : books,
            currentPage   : currentPage,
            maxPages      : maxPages,
            pageSize      : pageSize,
            sortColumn    : opts.sortColumn,
            sortAscending : opts.sortAscending
          });
        }
      });//cur.toArray
    })
  });
};//getBooks


/**
 * @param {String} columnName
 * @param {object} query
 * @returns {Promise}
 * @resolves {Array}
 */
export function getDistinctBookAttribute(columnName, query) {
  return collectionBooks.distinct(columnName, query).then(function(values) {
    return Book.distinguish(columnName, values);
  });
}


/**
 * @param {number} id of the book being requested
 * @return {Promise}
 * @resolves {Book}
 * @rejects {Error}
 */
export function getBook(id) {
  return ConnectPromise.then(function() {
    var p;
    p = new Promise(function(resolve, reject) {
      var cur, err;
      try {
        cur = collectionBooks.find({
          id: id
        });
        return cur.toArray(function(curErr, books) {
          if (curErr) {
            return reject(curErr);
          } else {
            logger.info('(from db) resolve');
            return resolve(books[0]);
          }
        });
      } catch (_error) {
        err = _error;
        logger.error("Error occurred while trying to fetch id: " + id + "\n", err);
        return reject(err);
      }
    });
    return p;
  });
};

