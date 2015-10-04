/**
 * Deals with all adapters. Sits between the Horace app and all adapters.
 * @module adapter
 */
var $Config, $Utils, $Winston, _, adapterMap, adapters, getAdapterForBook, getBook, getBookForDownload, getBookOld, loadAdapters, logLevel, logger, toArray;

$Config = require('./config.js');

$Winston = require('Winston');

_ = require('lodash');

$Utils = require('./utils.js');

logLevel = $Config('horace.adapters.logLevel');

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: logLevel
    }), new $Winston.transports.File({
      filename: 'horace-adapters.log'
    })
  ]
});

adapters = [];

adapterMap = {};

loadAdapters = function() {
  var adapter, adapterId, adapterPath, adapterPaths, i, len, results;
  logger.info('Loading adapters. . .');
  adapterPaths = $Config('horace.defaultAdapters');
  adapterPaths = adapterPaths.concat($Config('horace.adapters'));
  logger.info("adapters to be loaded: \n\t" + (adapterPaths.join('\n\t')));
  adapters = _.map(adapterPaths, function(adapterPath) {
    logger.info("adapterPath: " + adapterPath);
    return require(adapterPath);
  });
  adapters = [];
  adapterMap = {};
  results = [];
  for (i = 0, len = adapterPaths.length; i < len; i++) {
    adapterPath = adapterPaths[i];
    adapter = require(adapterPath);
    adapterId = adapter.getAdapterId();
    adapterMap[adapterId] = adapter;
    results.push(adapters.push(adapter));
  }
  return results;
};

loadAdapters();

toArray = function() {
  return adapters;
};

getAdapterForBook = function(book) {
  return adapterMap[book.adapterId];
};

getBook = function(path) {
  var getBookProxy;
  logger.info("getBook('" + path + "')");
  adapters = toArray();
  logger.debug(adapters.length + " adapters");
  getBookProxy = function(adptr, index) {
    return adptr.getBook(path);
  };
  return $Utils.findPromise(adapters, getBookProxy, _.identity);
};

getBookOld = function(path) {
  var p0, promises;
  adapters = toArray();
  logger.info("getBook('" + path + "')");
  logger.debug(adapters.length + " adapters");
  promises = _.map(adapters, function(a) {
    return new Promise(function(resolve, reject) {
      return a.getBook(path)["catch"](function(err) {
        logger.error("Adapter " + (a.getAdapterId()) + " threw an error %o", err);
        return reject(err);
      }).then(function(book) {
        logger.debug("** resolved " + path + " with %o", book);
        return resolve(book);
      });
    });
  });
  p0 = $Utils.conditionalRace(promises, function(x) {
    return !!x;
  });
  return new Promise(function(resolve, reject) {
    p0["catch"](function(err) {
      logger.error("Caught error for path: " + path);
      if (err) {
        logger.error('Throwing error to scanner: ', err);
        return reject(err);
      }
    });
    return p0.then(function(x) {
      logger.debug("Resolved for path: " + path);
      return resolve(x);
    });
  });
};


/**
 * Get a stream containing data for the indicated book in the target format.
 * @param {object} Book object
 * @param {string} target format
 * @return {Promise}
 * @resolves {Stream} Stream with the data for the book and format. May be simply piped to the http response
 * @rejects {Error}
 */

getBookForDownload = function(book, targetFormat) {
  return new Promise(function(resolve, reject) {
    var adapter, err;
    adapter = getAdapterForBook(book);
    if (!adapter) {
      err = new Error("Adapter >" + book.adapterId + "< not found.");
      logger.error(new Error("Adapter >" + book.adapterId + "< not found."));
      reject(err);
    }
    return resolve(adapter.getBookForDownload(book, targetFormat));
  });
};

module.exports = {
  toArray: toArray,
  getBook: getBook,
  getBookForDownload: getBookForDownload,
  getAdapterForBook: getAdapterForBook
};