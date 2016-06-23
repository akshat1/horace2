'use strict';

/**
 * @module db
 */

const MongoDB = require('mongodb');
const Winston = require('winston');

const PagerModel = require('./model/library-model.js').PagerModel;
const Config = require('./config.js');
const Book = require('./book.js');

const Collection = {
  Books: 'books'
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


const client = MongoDB.MongoClient;
const url = 'mongodb://localhost:27017/horace?maxPoolSize=10';
const TEXT_INDEX_NAME = 'BOOKS_TEXT_INDEX';

var collectionBooks = null;



var ConnectPromise = new Promise(function(resolve, reject) {
  client.connect(url, function(connectErr, db) {
    if(connectErr) {
      reject(connectErr);
    } else {
      collectionBooks = db.collection(Collection.Books);
      resolve(collectionBooks);
    }
  });
});


function makeTextIndex() {
  return collectionBooks.createIndex({ '$**': 'text' },{ name: TEXT_INDEX_NAME });
}


(function initialiseCollection() {
  return ConnectPromise
  .then(function(x) {
    return x.indexes();
  })
  .then(function(indexes) {
    let textIndexFound = false;
    for (let index of indexes) {
      if (index.name === TEXT_INDEX_NAME) {
        textIndexFound = true;
        break;
      }
    }
    if (!textIndexFound)
      return makeTextIndex();
  });
})()
.then(function() {
  logger.debug('Books collection initialised');
})
.catch(function(err) {
  console.error('Error initialising collection.', err);
});


// TODO: Don't upsert unless upsert flag present among
// arguments to avoid overwriting user edits while
// re-scanning.
function saveBook(book) {
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
          logger.info(`Saved book ${book.id}`);
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
}


/*
function _transformBooksQuery(pager, sort, filter) {
  return {
    currentPage   : pager.currentPage,
    pageSize      : pager.pageSize,
    sortColumn    : sort.columnName,
    sortAscending : sort.isAscending,
    filter        : filter
  };
}
*/


function getBooks(params) {
  return ConnectPromise.then(function(){
    return new Promise(function(resolve, reject){
      //var opts     = _transformBooksQuery(params.pager, params.sort, params.filter);
      var pager    = params.pager;
      var sort     = params.sort;
      var includeHidden = !!params.includeHidden;
      var filter   = params.filter ? Book.mongoFilter(params.filter, includeHidden) : {};
      var sortOpts = {};
      sortOpts[Book.getSortColumnName(sort.columnName)] = sort.isAscending ? 1 : -1;
      logger.debug('Going to find using ...\n', filter);
      var cur = collectionBooks.find(filter).sort(sortOpts);
      cur.toArray(function(curErr, books) {
        if(curErr){
          logger.error('Error converting to array', curErr);
          reject(curErr);

        } else {
          let {from, to} = pager;
          resolve({
            books  : books.slice(from, to),
            pager  : new PagerModel(from, to, books.length),
            sort   : sort,
            filter : params.filter || {}
          });
        }// if (curErr)
      });//cur.toArray
    });
  });
}//getBooks


/**
 * @param {String} columnName
 * @param {object} query
 * @returns {Promise}
 * @resolves {Array}
 */
function getDistinctBookAttribute(columnName, query) {
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
function getBook(id) {
  return ConnectPromise.then(function() {
    var p;
    p = new Promise(function(resolve, reject) {
      var cur, err;
      try {
        var qre = {
          id: id
        };
        logger.info('query is: ', qre);
        cur = collectionBooks.find(qre);
        return cur.toArray(function(curErr, books) {
          if (curErr) {
            return reject(curErr);
          } else {
            logger.info('(from db) resolve');
            logger.info('got result: ', books);
            return resolve(books[0]);
          }
        });
      } catch (_error) {
        err = _error;
        logger.error(`Error occurred while trying to fetch id: ${id} \n`, err);
        return reject(err);
      }
    });
    return p;
  });
}


function hideBook(id) {
  return ConnectPromise.then(function() {
    return getBook(id)
      .then(function(book) {
        if(book) {
          logger.debug('got book for id: ', id);
          book.isHidden = true;
          return saveBook(book);
        } //else -- ignore requests to hide unknown books
        else {
          logger.debug('Book not found for id: ', id);
        }
      });
  });
}


function unHideAllBooks() {
  return ConnectPromise.then(function() {
    collectionBooks.find({
      'isHidden': {
        'eq': true
      }
    }).toArray(function(err, books) {
      books.forEach(function(book) {
        delete book.isHidden;
        saveBook(book);
      });
    });
  });
}


module.exports = {
  saveBook: saveBook,
  getBooks: getBooks,
  getDistinctBookAttribute: getDistinctBookAttribute,
  getBook: getBook,
  hideBook: hideBook,
  unHideAllBooks: unHideAllBooks
}
