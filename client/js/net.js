var $H, $ServerEvents, _, _off, _on, _socket, dispatch, downloadFile, getBooks, getSocket, requestDownload;

$H = require('./http.js');

_ = require('lodash');

$ServerEvents = require('../../app/server-events.js');

_socket = null;

downloadFile = function(url, success) {
  var _frame;
  _frame = document.createElement('iframe');
  _frame.className = 'downloadFrame';
  _frame.height = '100px';
  _frame.width = '100px';
  document.body.appendChild(_frame);
  return _frame.src = url;
};

getSocket = function() {
  if (!_socket) {
    _socket = io.connect(window.location.origin, {
      path: HoraceConf.socketIOURL
    });
  }
  return _socket;
};

dispatch = function(eventName, args) {
  var socket;
  console.debug('dispatch(%s, %o)', eventName, args);
  socket = getSocket();
  return socket.emit(eventName, args);
};

_on = function(eventName, callback) {
  return getSocket().on(eventName, callback);
};

_off = function(eventName, callback) {
  return getSocket().off(eventName, callback);
};

getBooks = function(query) {
  var opts;
  opts = {
    url: '/api/books',
    responseType: $H.ResponseType.JSON,
    data: query
  };
  return $H.get(opts);
};

requestDownload = function(book) {
  console.debug('requestDownload(%o)', book);

  /*
  opts =
    url : '/api/requestDownload'
    data :
      id : book.id
  $H.get opts
   */
  return dispatch($ServerEvents.REQUEST_BOOK_DOWNLOAD, {
    bookId: book.id
  });
};

_.extend(module.exports, {
  dispatch: dispatch,
  'on': _on,
  'off': _off,
  getBooks: getBooks,
  requestDownload: requestDownload
});