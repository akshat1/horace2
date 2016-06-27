const SocketIO = require('socket.io');
const Horace = require('./horace.js');
const UrlMap = require('./urls.js').UrlMap;
const ServerUrlMap = UrlMap.Server;
const ServerEvents = require('./events.js').Server;

module.exports.setup = function setup(server, socketIOURL) {
  //Set up websockets
  const io = SocketIO.listen(server, {
    path: socketIOURL
  });


  function handleScanStarted() {
    io.emit(ServerEvents.SCANNER_SCANSTARTED);
  }


  function handleScanStopped() {
    io.emit(ServerEvents.SCANNER_SCANSTOPPED);
  }


  function handleConnection(socket) {
    console.log('WS Connected!'); //TODO: Find out why this is printed twice
    socket.emit('hello', {
      id: socket.id
    });

    socket.on(ServerEvents.REQUEST_BOOK_DOWNLOAD, function(query) {
      logger.debug('BOOK DOWNLOAD REQUESTED // %o', query);
      return Horace.requestDownload(parseInt(query.bookId))
        .then(function({tmpFilePath, title}) {
          logger.debug(`\n$$$$$\nsend message that the download is ready at ${tmpFilePath}.`);
          let fileName = Path.basename(tmpFilePath);
          return socket.emit(ServerEvents.BOOK_READY_FOR_DOWNLOAD, {
            title: title,
            path: ServerUrlMap.fileDownload(fileName),
            bookId: query.bookId
          });
        })
        .catch(function(err) {
          return console.error('\n$$$$$\nsend error via socket', err);
        });
    });
  }


  //Websocket broadcasts
  Horace.on(ServerEvents.SCANNER_SCANSTARTED, handleScanStarted);
  Horace.on(ServerEvents.SCANNER_SCANSTOPPED, handleScanStopped);
  io.on('connection', handleConnection);
}
