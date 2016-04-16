'use strict';

const SocketIO     = require('socket.io');
const Path         = require('path');
const ServerEvents = require('../events.js').Server;
const UrlMap       = require('../urls.js').UrlMap;
const ServerUrlMap = UrlMap.Server;


function setUpSocketIO(socketIOURL, server, horaceInstance) {
  const io = SocketIO.listen(server, {
    path: socketIOURL
  });


  //Websocket broadcasts
  horaceInstance.on(ServerEvents.SCANNER_SCANSTARTED, function() {
    io.emit(ServerEvents.SCANNER_SCANSTARTED);
  });

  horaceInstance.on(ServerEvents.SCANNER_SCANSTOPPED, function() {
    io.emit(ServerEvents.SCANNER_SCANSTOPPED);
  });

  io.on('connection', function(socket) {
    console.log('WS Connected!'); //TODO: Find out why this is printed twice
    socket.emit('hello', {
      id: socket.id
    });

    socket.on(ServerEvents.REQUEST_BOOK_DOWNLOAD, function(query) {
      return horaceInstance.requestDownload(parseInt(query.bookId))
        .then(function(tmpFilePath) {
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
}


module.exports = {
  setUp: setUpSocketIO
}
