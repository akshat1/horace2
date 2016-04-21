'use strict';

const Express      = require('express');
const UrlMap       = require('../urls.js').UrlMap;
const ServerUrlMap = UrlMap.Server;
const apiRouter    = Express.Router();
const Winston      = require('winston');


const logLevel = 'debug'; //Config('horace.server.logLevel');
const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: logLevel
    }), new Winston.transports.File({
      filename: 'log/horace-api.log'
    })
  ]
});


function getRouter(horaceInstance) {
  // Set up the api router
  apiRouter.get(ServerUrlMap['Command.StartScan'], function(request, response) {
    logger.debug('Start Scan');
    horaceInstance.startScan();
    return response.send('OK');
  });

  apiRouter.get(ServerUrlMap['Status.IsScanning'], function(request, response) {
    return response.json(horaceInstance.isScanningForBooks());
  });

  apiRouter.post(ServerUrlMap['Books'], function(request, response) {
    logger.debug('getBooks');
    var query = request.body;
    return horaceInstance.getBooks(query)
      .then(function(res) {
        return response.json(res);
      })
      .catch(function(err) {
        logger.error('Error fetching books from Horace %o', err);
        return response.status(500).send(err);
      });
  });

  apiRouter.get(ServerUrlMap['Books.Distinct'], function(request, response) {
    logger.debug(`get[${ServerUrlMap['Books.Distinct']}]`);
    var columnName = request.params.columnName;
    horaceInstance.getDistinctBookAttribute(columnName)
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
  });

  apiRouter.get(ServerUrlMap['Book.Hide'], function(request, response) {
    logger.debug(`get[${ServerUrlMap['BookHide']}]`);
    let bookIds = request.params.bookIds;
    logger.debug('hide bookIds: ', bookIds);
    logger.debug(typeof bookIds);
    bookIds = bookIds.split(',');
    logger.debug(typeof bookIds);
    Promise.all(bookIds.map(function(bookId){
      return horaceInstance.hideBook(bookId);
    }))
      .then(function() {
        logger.debug('ALL BOOKS HIDDEN');
        return response.status(200).send('OK');
      })
      .catch(function(err) {
        logger.error(`Error hiding book ${bookId}`, err);
        response.status(500).send(err);
        return;
      });
  });

  apiRouter.get(ServerUrlMap['Books.Unhide'], function(request, response) {
    logger.debug(`get[${ServerUrlMap['Books.']}]`);
    return horaceInstance.unHideAllBooks();
  });

  return apiRouter;
}


module.exports = {
  getRouter: getRouter
};
