'use strict';

const Winston = require('winston');
const Express = require('express');
const apiRouter = Express.Router();
const Horace = require('./horace.js');
const UrlMap = require('./urls.js').UrlMap;
const ServerUrlMap = UrlMap.Server;
const Config = require('./config.js');
const Utils = require('./utils.js');

const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: Config('horace.server.logLevel')
    }), new Winston.transports.File({
      filename: 'horace-server.log'
    })
  ]
});


// Various handles
function handleStartScan(request, response) {
  logger.debug('Start Scan');
  Horace.startScan();
  return response.send('OK');
}


function handleIsScanning(request, response) {
  return response.json(Horace.isScanningForBooks());
}


function handleGetBooks(request, response) {
  logger.debug('getBooks');
  var query = request.body;
  return Horace.getBooks(query)
    .then(function(res) {
      return response.json(res);
    })
    .catch(function(err) {
      logger.error('Error fetching books from Horace %o', err);
      return response.status(500).send(err);
    });
}


function handleUpdateBooks(request, response) {
  let books = request.body.books;
  function dbUpdateSucceeded() {
    return response.json(books);
  }

  function dbUpdateFailed(err) {
    console.error(err);
    return response.status(500).send(err);
  }

  return Utils.forEachPromise(books, function(book) {
      return Horace.updateBook(book);
    })
    .then(dbUpdateSucceeded)
    .catch(dbUpdateFailed);
}


function handleGetDistinctBookPropertyValues(request, response) {
  logger.debug(`get[${ServerUrlMap['Books.Distinct']}]`);
  var columnName = request.params.columnName;
  Horace.getDistinctBookAttribute(columnName)
    .then(function(values){
      logger.debug(`Got ${values.length} distinct values`);
      response.json(values);
      return;
    })
    .catch(function(err){
      logger.error(`Error fetching distinct value for book['${columnName}']`, err);
      response.status(500).send(err);
      return;
    });
  return;
}


function handleHideBook(request, response) {
  logger.debug(`get[${ServerUrlMap['BookHide']}]`);
  let bookIds = request.params.bookIds;
  logger.info('hide bookIds: ', bookIds);
  bookIds = bookIds.split(',');
  Promise.all(bookIds.map(function(bookId){
    return Horace.hideBook(bookId);
  }))
    .then(function() {
      return response.status(200).send('OK');
    })
    .catch(function(err) {
      logger.error(`Error hiding book ${bookId}`, err);
      response.status(500).send(err);
      return;
    });
}


function handleUnHideBook(request, response) {
  logger.info(`get[${ServerUrlMap['Books.']}]`);
  return Horace.unHideAllBooks();
}


apiRouter.get(ServerUrlMap['Command.StartScan'], handleStartScan);
apiRouter.get(ServerUrlMap['Status.IsScanning'], handleIsScanning);
apiRouter.post(ServerUrlMap['Books'], handleGetBooks);
apiRouter.post(ServerUrlMap['Books.Update'], handleUpdateBooks);
apiRouter.get(ServerUrlMap['Books.Distinct'], handleGetDistinctBookPropertyValues);
apiRouter.get(ServerUrlMap['Book.Hide'], handleHideBook);
apiRouter.get(ServerUrlMap['Books.Unhide'], handleUnHideBook);

module.exports = apiRouter;
