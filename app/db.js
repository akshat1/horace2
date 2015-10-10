/**
 * @module db
 */
var $Config, $FSExtra, $MongoDB, $Sorting, $Winston, Collection, _, _connect, _isConnected, client, collectionBooks, getBook, getBooks, logLevel, logger, saveBook, url;

$MongoDB = require('mongodb');

$Winston = require('winston');

_ = require('lodash');

$FSExtra = require('fs-extra');

$Config = require('./config.js');

$Sorting = require('./sorting.js');

Collection = {
  Books: 'horace-books'
};

logLevel = $Config('horace.db.logLevel');

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: logLevel
    }), new $Winston.transports.File({
      filename: 'horace-db.log'
    })
  ]
});


/*
dbLocation = $Config 'horace.db.location'
throw new Error 'dbLocation not defined' unless dbLocation
logger.info "Ensure #{dbLocation}"
$FSExtra.ensureDir dbLocation

logger.info 'Create db instance'
Engine = $Tingo()
database = new Engine.Db dbLocation, {}
 */

client = $MongoDB.MongoClient;

url = 'mongodb://localhost:27017/horace?maxPoolSize=10';

_isConnected = false;

collectionBooks = null;

_connect = function() {
  return new Promise(function(resolve, reject) {
    if (_isConnected) {
      return resolve();
    } else {
      return client.connect(url, function(connectErr, db) {
        if (connectErr) {
          console.error('Unable to connect to mongodbn. Error: ', connectErr);
          return reject(connectErr);
        } else {
          _isConnected = true;
          collectionBooks = db.collection('books');
          return resolve();
        }
      });
    }
  });
};

saveBook = function(book) {
  logger.info('saveBook(%o)', book.id);
  return _connect().then(function() {
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

getBooks = function(opts) {
  var defaults = {
    sortColumn: 'title',
    sortAscending: true
  };
  var sortOpts = {};
  sortOpts[opts.sortColumn] = opts.sortAscending ? 1 : -1;
  opts = _.assign(defaults, opts);
  return _connect().then(function() {
    var p;
    /*
    p = new Promise(function(resolve, reject) {
      var cur, sortOpts;
      logger.info('getBooks(%o)', opts);
      sortOpts = {};
      sortOpts[opts.sortcolumnName || $Sorting.SortColumn.Title] = opts.sortDirection === $Sorting.SortDirection.ASC ? 1 : -1;
      logger.debug('sortOpts: ', sortOpts);
      cur = collectionBooks.find().sort(sortOpts);
      return cur.toArray(function(curErr, books) {
        var from, to, totalBooks;
        if (curErr) {
          logger.error('Error converting to array', curErr);
          return reject(curErr);
        } else {
          from = parseInt(opts.from) || 0;
          to = from + parseInt(opts.numItems);
          totalBooks = books.length;
          if (!isNaN(to)) {
            books = books.slice(from, to);
          }
          logger.debug("Return " + books.length + " books");
          return resolve({
            from: from,
            numItems: numItems,
            totalItems: totalBooks,
            books: books
          });
        }
      });
    });
    return p;
    */
    console.log('getBooks:', opts);
    console.log('sort: ', sortOpts);
    return new Promise(function(resolve, reject){
      var cur = collectionBooks.find().sort(sortOpts);
      cur.toArray(function(curErr, books) {
        if(curErr){
          logger.error('Error converting to array', curErr);
          return reject(curErr);

        } else {
          var currentPage = parseInt(opts.currentPage);
          var pageSize = parseInt(opts.pageSize);
          var from = currentPage* pageSize;
          var to = from + pageSize;
          console.log('Extract books ' + from + ' to ' + to);
          var maxPages = books.length ? Math.ceil(books.length / pageSize) : 0;
          books = books.slice(from, to);
          var response = {
            books: books,
            currentPage: currentPage,
            maxPages: maxPages,
            pageSize: pageSize,
            sortColumn: opts.sortColumn,
            sortAscending: opts.sortAscending
          };
          //console.log('Respond with :', opts);
          resolve(response);
        }
      });//cur.toArray
    });//return new Promise(function(resolve, reject){
  });//_connect.then
};//getBooks


/**
 * @param {number} id of the book being requested
 * @return {Promise}
 * @resolves {Book}
 * @rejects {Error}
 */

getBook = function(id) {
  return _connect().then(function() {
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

module.exports = {
  saveBook: saveBook,
  getBooks: getBooks,
  getBook: getBook
};