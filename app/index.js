/**
 * @module index
 */
var $Config, $Express, $FSExtra, $Horace, $Path, $ServeStatic, $ServerEvents, $SocketIO, $URL, $Utils, $Winston, Gulp, GulpFile, _, apiRouter, app, downloadDirURL, io, listenPort, logLevel, logger, server, serverSubDir, serverTmpPath, socketIOURL, webroot, webrootURL,
  slice = [].slice;

$Path = require('path');

$Winston = require('winston');

$Express = require('express');

$ServeStatic = require('serve-static');

$SocketIO = require('socket.io');

$FSExtra = require('fs-extra');

$URL = require('url');

_ = require('lodash');

$ServerEvents = require('./server-events.js');

$Config = require('./config.js');

$Utils = require('./utils.js');

$Horace = require('./horace.js');

if ($Config('horace.rebuildClientAtStartup')) {
  console.log('start gulp');
  Gulp = require('gulp');
  GulpFile = require('../gulpfile.js');
  Gulp.start('default');
}

logLevel = $Config('horace.server.logLevel');

console.log('logLevel: ', logLevel);

serverTmpPath = $Path.join(__dirname, '..', $Config('horace.tmpDirPath'));

serverSubDir = $Config('horace.urlSubDir').replace(/\/$/, '') || '/';

webroot = $Path.join(__dirname, '..', $Config('horace.webroot'));

listenPort = new Number($Config('horace.port')).valueOf();

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: logLevel
    }), new $Winston.transports.File({
      filename: 'horace-server.log'
    })
  ]
});

logger.info('listenPort    : ', listenPort);

logger.info('serverTmpPath : ', serverTmpPath);

logger.info('webroot       : ', webroot);

$FSExtra.ensureDir(serverTmpPath);

$FSExtra.ensureDir(webroot);

app = $Express();

downloadDirURL = $Path.join(serverSubDir, 'download');

webrootURL = $Path.join(serverSubDir, serverSubDir).replace(/\./, '/');

logger.info('downloadDirURL : ', downloadDirURL);

logger.info('webrootURL     : ', webrootURL);

app.use(downloadDirURL, $ServeStatic(serverTmpPath));

app.use(webrootURL, $ServeStatic(webroot));

app.use('/config', function(req, res) {
  var str;
  str = "window.HoraceConf = " + (JSON.stringify($Config('web.client.config'))) + ";\nwindow.HoraceConf['webrootURL'] = \"" + webrootURL + "\";\nwindow.HoraceConf['socketIOURL'] = \"" + socketIOURL + "\";";
  return res.send(str);
});

apiRouter = $Express.Router();

apiRouter.get('/command/StartScan', function(request, response) {
  logger.debug('Start Scan');
  $Horace.startScan();
  return response.send('OK');
});

apiRouter.get('/books', function(request, response) {
  var query;
  logger.debug('getBooks');
  query = $URL.parse(request.url, true).query;
  return $Horace.getBooks(query)["catch"](function(err) {
    logger.error('Error fetching books from Horace %o', error);
    return response.status(500).send(err);
  }).then(function(books) {
    if (books == null) {
      books = [];
    }
    logger.debug('Got %d books', books.length);
    return response.json(books);
  });
});

apiRouter.get('/requestDownload', function(request, response) {
  var query;
  logger.debug('requestDownload');
  query = $URL.parse(request.url, true).query;
  logger.debug('query: ', query);
  response.send('OK');
  return $Horace.requestDownload(parseInt(query.id))["catch"](function(err) {
    return console.error('\n$$$$$\nsend error via socket', err);
  }).then(function(tmpFilePath) {
    logger.debug('\n$$$$$\nsend message that the download is ready.');
    return socket.emit($ServerEvents.BOOK_READY_FOR_DOWNLOAD, {
      path: tmpFilePath
    });
  });
});

app.use('/api', apiRouter);

server = app.listen(listenPort, function() {
  return logger.info("Listening on " + (this.address()));
});

socketIOURL = $Path.join(serverSubDir, 'socket.io');

io = $SocketIO.listen(server, {
  path: socketIOURL
});

io.on('connection', function(socket) {
  var eventNameKeys;
  socket.emit('hello', {
    id: socket.id
  });
  socket.on($ServerEvents.REQUEST_BOOK_DOWNLOAD, function(query) {
    logger.debug('BOOK DOWNLOAD REQUESTED // %o', query);
    return $Horace.requestDownload(parseInt(query.bookId)).then(function(tmpFilePath) {
      var fileName;
      logger.debug("\n$$$$$\nsend message that the download is ready at " + tmpFilePath + ".");
      fileName = $Path.basename(tmpFilePath);
      return socket.emit($ServerEvents.BOOK_READY_FOR_DOWNLOAD, {
        path: "/download/" + fileName
      });
    })["catch"](function(err) {
      return console.error('\n$$$$$\nsend error via socket', err);
    });
  });
  eventNameKeys = _.keys($Horace.Event);
  return _.each(eventNameKeys, function(key) {
    var eventName;
    eventName = $Horace.Event[key];
    return $Horace.on(eventName, function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      args.unshift(eventName);
      return socket.emit.apply(socket, args);
    });
  });
});

$Horace.on;