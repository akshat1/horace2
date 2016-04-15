'use strict';

/**
 * @module db
 */

var MongoDB = require('mongodb');
var Winston = require('winston');

var PagerModel = require('./model/library-model.js').PagerModel;
var Config = require('./config.js');
var Book = require('./book.js');

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

var collectionBooks = null;



var ConnectPromise = new Promise(function(resolve, reject) {
  client.connect(url, function(connectErr, db) {
    if(connectErr) {
      reject(connectErr);
    } else {
      collectionBooks = db.collection(Collection.Books);
      resolve();
    }
  });
});


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
      sortOpts[sort.columnName] = sort.isAscending ? 1 : -1;
      var cur = collectionBooks.find(filter).sort(sortOpts);
      cur.toArray(function(curErr, books) {
        if(curErr){
          logger.error('Error converting to array', curErr);
          return reject(curErr);
        } else {
          //var currentPage = pager.currentPage;
          //var pageSize = pager.pageSize;
          var from = pager.from;
          var to = pager.to;
          //var maxPages = books.length ? Math.ceil(books.length / pageSize) : 0;
          books = books.slice(from, to);
          resolve(collectionBooks.count()
            .then(function(totalBooksInSystem) {
              return {
                books  : books,
                pager  : new PagerModel(from, to, totalBooksInSystem),
                sort   : sort,
                filter : params.filter || {}
              };
            }));
        }
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
        console.log('query is: ', qre);
        cur = collectionBooks.find(qre);
        return cur.toArray(function(curErr, books) {
          if (curErr) {
            return reject(curErr);
          } else {
            logger.info('(from db) resolve');
            console.log('got result: ', books);
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
          console.log('got book for id: ', id);
          book.isHidden = true;
          return saveBook(book);
        } //else -- ignore requests to hide unknown books
        else {
          console.log('Book not found for id: ', id);
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
