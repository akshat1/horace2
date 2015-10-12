'use strict';

/**
 * Deals with all adapters. Sits between the Horace app and all adapters.
 * @module adapter
 */


import Winston from 'Winston';
import _ from 'lodash';

import Config from './config.js';
import * as Utils from './utils.js';

const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: Config('horace.adapters.logLevel')
    }), new Winston.transports.File({
      filename: 'horace-adapters.log'
    })
  ]
});

var adapters = [];
var adapterMap = {};

function loadAdapters() {
  logger.info('Loading adapters. . .');
  var adapterPaths = Config('horace.defaultAdapters');
  adapterPaths = adapterPaths.concat(Config('horace.adapters'));
  logger.info("adapters to be loaded: \n\t" + (adapterPaths.join('\n\t')));
  adapters = adapterPaths.map(function(adapterPath) {
    logger.info("adapterPath: " + adapterPath);
    return require(adapterPath);
  });
  adapters = [];
  adapterMap = {};
  adapterPaths.forEach(function(adapterPath){
    logger.info(`adapter.loadAdapters:: load "${adapterPath}"`);
    let adapter = require(adapterPath);
    adapterMap[adapter.getAdapterId()] = adapter;
    adapters.push(adapter);
  });
}

loadAdapters();

function toArray() {
  return adapters;
}


function getAdapterForBook(book) {
  return adapterMap[book.adapterId];
}


export function getBook(path) {
  logger.info(`adapter.getBook(${path})`);
  var adapters = toArray();
  if(adapters.length < 1) {
    throw new Error('No adapters configured in system');
  }
  var getBookProxy = function(adptr, index) {
    return adptr.getBook(path);
  };
  let p = Utils.findPromise(adapters, getBookProxy, _.identity, true);
  p.catch(function(err){
    logger.error(`adapter.getBook(${path}) encountered error`, err);
  });
  return p;
}


/**
 * Get a stream containing data for the indicated book in the target format.
 * @param {Book} Book object
 * @param {string} target format
 * @return {Promise}
 * @resolves {Stream} Stream with the data for the book and format. May be simply piped to the http response
 * @rejects {Error}
 */
export function getBookForDownload(book, targetFormat) {
  return new Promise(function(resolve, reject) {
    var adapter = getAdapterForBook(book);
    if (!adapter) {
      var err = new Error("Adapter >" + book.adapterId + "< not found.");
      logger.error(new Error("Adapter >" + book.adapterId + "< not found."));
      reject(err);
    }
    return resolve(adapter.getBookForDownload(book, targetFormat));
  });
};
