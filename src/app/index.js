'use strict';

/**
 * @module index
 */

import Path from 'path';
import Winston from 'winston';
import Express from 'express';
import ServeStatic from 'serve-static';
import SocketIO from 'socket.io';
import FSExtra from 'fs-extra';
import URL from 'url';
import _ from 'lodash';

import * as Events from './events.js';
import Config from './config.js';
import Utils from './utils.js';
import * as Horace from './horace.js';


const ServerEvents = Events.Server;
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
  Gulp = require('gulp');
  GulpFile = require('../gulpfile.js');
  Gulp.start('default');
}


// Start Server
const logLevel       = Config('horace.server.logLevel');
const serverTmpPath  = Path.join(__dirname, '..', Config('horace.tmpDirPath'));
const serverSubDir   = Config('horace.urlSubDir').replace(/\/$/, '') || '/';
const webroot        = Path.join(__dirname, '..', Config('horace.webroot'));
const listenPort     = new Number(Config('horace.port')).valueOf();
const downloadDirURL = Path.join(serverSubDir, 'download');
const webrootURL     = Path.join(serverSubDir, serverSubDir).replace(/\./, '/');
const socketIOURL    = Path.join(serverSubDir, 'socket.io');
const EventNameKeys  = _.keys(Horace.Event);
const app = Express();
const apiRouter = Express.Router();

logger.info('listenPort     : ', listenPort);
logger.info('serverTmpPath  : ', serverTmpPath);
logger.info('webroot        : ', webroot);
logger.info('downloadDirURL : ', downloadDirURL);
logger.info('webrootURL     : ', webrootURL);

FSExtra.ensureDir(serverTmpPath);
FSExtra.ensureDir(webroot);


// Set up routes
app.use(downloadDirURL, ServeStatic(serverTmpPath));
app.use(webrootURL, ServeStatic(webroot));
app.use('/config', function(req, res) {
  var str;
  str = "window.HoraceConf = " + (JSON.stringify(Config('web.client.config'))) + ";\nwindow.HoraceConf['webrootURL'] = \"" + webrootURL + "\";\nwindow.HoraceConf['socketIOURL'] = \"" + socketIOURL + "\";";
  return res.send(str);
});


// Set up the api router
apiRouter.get('/command/StartScan', function(request, response) {
  logger.debug('Start Scan');
  Horace.startScan();
  return response.send('OK');
});


apiRouter.get('/books', function(request, response) {
  logger.debug('getBooks');
  var query = URL.parse(request.url, true).query;
  return Horace.getBooks(query)
    .then(function(books) {
      books = books || [];
      logger.debug('Got %d books', books.length);
      return response.json(books);
    })
    .catch(function(err) {
      logger.error('Error fetching books from Horace %o', error);
      return response.status(500).send(err);
    });
});


apiRouter.get('/requestDownload', function(request, response) {
  logger.debug('requestDownload');
  var query = $URL.parse(request.url, true).query;
  logger.debug('query: ', query);
  response.send('OK');
  return Horace.requestDownload(parseInt(query.id))
    .then(function(tmpFilePath) {
      logger.debug('\n$$$$$\nsend message that the download is ready.');
      return socket.emit(ServerEvents.BOOK_READY_FOR_DOWNLOAD, {
        path: tmpFilePath
      });
    })
    .catch(function(err) {
      return console.error('\n$$$$$\nsend error via socket', err);
    });
});


app.use('/api', apiRouter);


//Set up websockets
const server = app.listen(listenPort, function() {
  return logger.info("Listening on " + (this.address()));
});

const io = SocketIO.listen(server, {
  path: socketIOURL
});

io.on('connection', function(socket) {
  socket.emit('hello', {
    id: socket.id
  });

  socket.on(ServerEvents.REQUEST_BOOK_DOWNLOAD, function(query) {
    logger.debug('BOOK DOWNLOAD REQUESTED // %o', query);
    return Horace.requestDownload(parseInt(query.bookId))
      .then(function(tmpFilePath) {
        logger.debug("\n$$$$$\nsend message that the download is ready at " + tmpFilePath + ".");
        let fileName = $Path.basename(tmpFilePath);
        return socket.emit($ServerEvents.BOOK_READY_FOR_DOWNLOAD, {
          path: "/download/" + fileName
        });
      })
      .catch(function(err) {
        return console.error('\n$$$$$\nsend error via socket', err);
      });
  });

  return _.each(EventNameKeys, function(key) {
    let eventName = Horace.Event[key];
    return Horace.on(eventName, function() {
      let args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      args.unshift(eventName);
      return socket.emit.apply(socket, args);
    });
  });
});
