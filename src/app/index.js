'use strict';

/**
 * @module index
 */

import Path from 'path';
import Winston from 'winston';
import Express from 'express';
import BodyParser from 'body-parser';
import ServeStatic from 'serve-static';
import SocketIO from 'socket.io';
import FSExtra from 'fs-extra';
import _ from 'lodash';
import Mime from 'mime';

import {Server as ServerEvents} from './events.js';
import UrlMap from './urls.js';
import Config from './config.js';
import Horace from './horace.js';

const ServerUrlMap = UrlMap.Server;

const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: logLevel
    }), new Winston.transports.File({
      filename: 'horace-server.log'
    })
  ]
});

// Run Gulp if required
if (Config('horace.rebuildClientAtStartup')) {
  var Gulp = require('gulp');
  require('../gulpfile.js');
  Gulp.start('default');
}


// Start Server
const logLevel       = Config('horace.server.logLevel');
const serverTmpPath  = Path.join(__dirname, '..', Config('horace.tmpDirPath'));
const serverSubDir   = Config('horace.urlSubDir').replace(/\/$/, '') || '/';
const webroot        = Path.join(__dirname, '..', Config('horace.webroot'));
const listenPort     = new Number(Config('horace.port')).valueOf();
const webrootURL     = Path.join(serverSubDir, serverSubDir).replace(/\./, '/');
const socketIOURL    = Path.join(serverSubDir, 'socket.io');
const app = Express();
app.use(BodyParser.json());
const apiRouter = Express.Router();

logger.info('listenPort     : ', listenPort);
logger.info('serverTmpPath  : ', serverTmpPath);
logger.info('webroot        : ', webroot);
logger.info('webrootURL     : ', webrootURL);

FSExtra.ensureDir(serverTmpPath);
FSExtra.ensureDir(webroot);


const server = app.listen(listenPort, function() {
  return logger.info(`Listening on :`, this.address());
});

//Set up websockets
const io = SocketIO.listen(server, {
  path: socketIOURL
});


//Websocket broadcasts
Horace.on(ServerEvents.SCANNER_SCANSTARTED, function() {
  io.emit(ServerEvents.SCANNER_SCANSTARTED);
});


Horace.on(ServerEvents.SCANNER_SCANSTOPPED, function() {
  io.emit(ServerEvents.SCANNER_SCANSTOPPED);
});


io.on('connection', function(socket) {
  console.log('WS Connected!'); //TODO: Find out why this is printed twice
  socket.emit('hello', {
    id: socket.id
  });

  socket.on(ServerEvents.REQUEST_BOOK_DOWNLOAD, function(query) {
    logger.debug('BOOK DOWNLOAD REQUESTED // %o', query);
    return Horace.requestDownload(parseInt(query.bookId))
      .then(function(tmpFilePath) {
        logger.debug(`\n$$$$$\nsend message that the download is ready at ${tmpFilePath}.`);
        let fileName = Path.basename(tmpFilePath);
        return socket.emit(ServerEvents.BOOK_READY_FOR_DOWNLOAD, {
          path: ServerUrlMap.fileDownload(fileName)
        });
      })
      .catch(function(err) {
        return console.error('\n$$$$$\nsend error via socket', err);
      });
  });
});


// Set up routes
app.use(ServerUrlMap.fileDownload(), function (request, response) {
  logger.info('download file');
  var fileName = request.params.fileName;
  logger.info(`download: ${fileName}`);
  var fileReadStream = FSExtra.createReadStream(Path.join(serverTmpPath, fileName));
  fileReadStream.on('error', function(err) {
    console.error('Error reading file for download', err);
    response.end();
  });
  response.set('Content-Type', Mime.lookup(fileName));
  response.set('Content-Disposition', `attachment; filename="${fileName}"`);
  fileReadStream.pipe(response);
});

app.use(webrootURL, ServeStatic(webroot));
app.use(ServerUrlMap.Config, function(req, res) {
  var config = Config('web.client.config');
  _.extend(config, {
    webrootURL: webrootURL,
    socketIOURL: socketIOURL
  });
  var str = `window.HoraceConf = ${JSON.stringify(config, null, 4)}`;
  return res.send(str);
});


// Set up the api router
apiRouter.get(ServerUrlMap['Command.StartScan'], function(request, response) {
  logger.debug('Start Scan');
  Horace.startScan();
  return response.send('OK');
});


apiRouter.get(ServerUrlMap['Status.IsScanning'], function(request, response) {
  return response.json(Horace.isScanningForBooks());
});


apiRouter.post(ServerUrlMap['Books'], function(request, response) {
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
});


apiRouter.get(ServerUrlMap['Books.Distinct'], function(request, response) {
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
      response.sattus(500).send(err);
      return;
    });
  return;
});

app.use(ServerUrlMap.API, apiRouter);
