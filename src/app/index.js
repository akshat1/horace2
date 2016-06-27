'use strict';

/**
 * @module index
 */
const Path = require('path');
const Winston = require('winston');
const Express = require('express');
const BodyParser = require('body-parser');
const ServeStatic = require('serve-static');
const Mime = require('mime');

const FSExtra = require('fs-extra');
const _ = require('lodash');
const apiRouter = require('./api-router.js');
const IPC = require('./ipc.js');
const UrlMap = require('./urls.js').UrlMap;
const Config = require('./config.js');
const Websockets = require('./websockets.js');
const ServerUrlMap = UrlMap.Server;

const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: Config('horace.server.logLevel')
    }), new Winston.transports.File({
      filename: 'horace-server.log'
    })
  ]
});


// Run Gulp if required
if (Config('horace.rebuildClientAtStartup')) {
  let Gulp = require('gulp');
  require('../gulpfile.js');
  Gulp.start('default');
}


// Start Server
const serverTmpPath  = Path.join(__dirname, '..', Config('horace.tmpDirPath'));
const serverSubDir   = Config('horace.urlSubDir').replace(/\/$/, '') || '/';
const webroot        = Path.join(__dirname, '..', Config('horace.webroot'));
const listenPort     = new Number(Config('horace.port')).valueOf();
const urlRoot        = serverSubDir;
const socketIOURL    = Path.join('/', serverSubDir, 'socket.io');
const app = Express();
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


function handleServerStart() {
  return logger.info(`Listening on :`, this.address());
}


function handleDownloadfile(request, response) {
  logger.info('download file');
  let fileName = request.params.fileName;
  logger.info(`download: ${fileName}`);
  let fileReadStream = FSExtra.createReadStream(Path.join(serverTmpPath, fileName));
  fileReadStream.on('error', function(err) {
    console.error('Error reading file for download', err);
    response.end();
  });
  response.set('Content-Type', Mime.lookup(fileName));
  response.set('Content-Disposition', `attachment; filename="${fileName}"`);
  fileReadStream.pipe(response);
}


function handleGetConfig(req, res) {
  let config = Config('web.client.config');
  _.extend(config, {
    urlRoot: urlRoot,
    socketIOURL: socketIOURL
  });
  let str = `window.HoraceConf = ${JSON.stringify(config, null, 4)}`;
  return res.send(str);
}


const server = app.listen(listenPort, handleServerStart);
Websockets.setup(server, socketIOURL);
// Set up routes
appUse(ServerUrlMap.fileDownload(), handleDownloadfile);
// Static
logger.info('serving >', webroot, '<');
appUse('/', ServeStatic(webroot));
// Client Config
appUse(ServerUrlMap.Config, handleGetConfig);
// Set up the api router
appUse(ServerUrlMap.API, apiRouter);
