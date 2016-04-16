'use strict';

/**
 * @module index
 */
const Path         = require('path');
const Winston      = require('winston');
const Express      = require('express');
const BodyParser   = require('body-parser');
const ServeStatic  = require('serve-static');
const FSExtra      = require('fs-extra');
const _            = require('lodash');
const Mime         = require('mime');
const UrlMap       = require('./urls.js').UrlMap;
const ServerUrlMap = UrlMap.Server;
const Config       = require('./config.js');
const Horace       = require('./horace.js');
const websockets   = require('./server/websockets.js');
const apiRouter    = require('./server/apiRouter.js');


FSExtra.ensureDir('log');
const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: logLevel
    }), new Winston.transports.File({
      filename: 'log/horace-server.log'
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
const logLevel      = Config('horace.server.logLevel');
const serverTmpPath = Path.join(__dirname, '..', Config('horace.tmpDirPath'));
const serverSubDir  = Config('horace.urlSubDir').replace(/\/$/, '') || '/';
const webroot       = Path.join(__dirname, '..', Config('horace.webroot'));
const socketIOURL = Path.join('/', serverSubDir, 'socket.io');
const listenPort    = new Number(Config('horace.port')).valueOf();
const urlRoot       = serverSubDir;
const app           = Express();

app.use(BodyParser.json());

logger.info('listenPort    : ', listenPort);
logger.info('serverTmpPath : ', serverTmpPath);
logger.info('webroot       : ', webroot);
logger.info('socketIOURL   : ', socketIOURL);
logger.info('urlRoot       : ', urlRoot);

FSExtra.ensureDir(serverTmpPath);
FSExtra.ensureDir(webroot);


function appUse(url, o) {
  let url2 = Path.join('/', urlRoot, url);
  app.use(url2, o);
}


const server = app.listen(listenPort, function() {
  return logger.info(`Listening on :`, this.address());
});

//Set up websockets
websockets.setUp(socketIOURL, server, Horace);

// Set up routes
appUse(ServerUrlMap.fileDownload(), function (request, response) {
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

console.log('serving >', webroot, '<');
appUse('/', ServeStatic(webroot));
appUse(ServerUrlMap.Config, function(req, res) {
  var config = Config('web.client.config');
  _.extend(config, {
    urlRoot: urlRoot,
    socketIOURL: socketIOURL
  });
  var str = `window.HoraceConf = ${JSON.stringify(config, null, 4)}`;
  return res.send(str);
});



appUse(ServerUrlMap.API, apiRouter.getRouter(Horace));
