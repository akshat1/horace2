'use strict';

/**
@module net
<p>
Abstractions of Horace server functions.
</p><p>
Provides both HTTP as well as Websocket related utils.
</p>
*/

var Http = require('./http.js');
var ServerEvents = require('./../../../app/events.js').Server;
var UrlMap = require('./../../../app/urls.js').UrlMap;
var Path = require('path');

const ClientURLMap = UrlMap.Client;
window.ClientURLMap = ClientURLMap;


function getUrl(url) {
  return Path.join('.', url);
}


// -------------- Websockets stuff --------------
var socket = null;
function getSocket() {
  if(!socket) {
    socket = window.io.connect(window.location.origin, {
      path: window.HoraceConf.socketIOURL
    });
  }
  return socket;
}


function emitWebSocket(eventName, args) {
  getSocket().emit(eventName, args);
}


function onWebSocket(eventName, callback) {
  getSocket().on(eventName, callback);
}


function offWebSocket(eventName, callback) {
  getSocket().off(eventName, callback);
}

// ------------- /Websockets stuff --------------


// ----------------- End Point ------------------
function requestBookDownload(bookId) {
  emitWebSocket(ServerEvents.REQUEST_BOOK_DOWNLOAD, {
    bookId
  });
}


function downloadFile(url) {
  var frame = document.createElement('iframe');
  frame.className = 'h-download-frame';
  frame.height = '100px';
  frame.width = '100px';
  document.body.appendChild(frame);
  frame.src = url;
}


function getBooks(pager = {}, sort = {}, filter = {}, replaceBooks) {
  return Http.post({
    url          : getUrl(ClientURLMap['Books']()),
    responseType : Http.ResponseType.JSON,
    data         : {
      pager  : pager,
      sort   : sort,
      filter : filter
    }
  }).then(function(res) {
    return {
      books        : res.books,
      pager        : res.pager,
      sort         : res.sort,
      filter       : res.filter,
      replaceBooks : replaceBooks
    };
  });
}


function hideBooks(books) {
  return Http.get({
    url : getUrl(ClientURLMap['Book.Hide'](books.map(function(b) {return b.id;}).join(','))),
    data: {}
  });
}


var _distinctValues = {};
function getDistinctBookAttribute(columnName) {
  if (_distinctValues[columnName])
    return Promise.resolve(_distinctValues[columnName]);
  else
    return Http.get({
      url          : getUrl(ClientURLMap['Books.Distinct'](columnName)),
      responseType : Http.ResponseType.JSON
    }).then(function(values) {
      _distinctValues[columnName] = values;
      return values;
    });
}


function requestDownload(book) {
  emitWebSocket(ServerEvents.REQUEST_BOOK_DOWNLOAD, {
    bookId: book.id
  });
}


function isServerScanningForBooks() {
  return Http.get({
    url: getUrl(ClientURLMap['Status.IsScanning']()),
    responseType: Http.ResponseType.JSON
  });
}


function doStartScanning() {
  Http.get({
    url: getUrl(ClientURLMap['Command.StartScan']())
  });
}


function updateBooks(books) {
  return Http.post({
    url: getUrl(ClientURLMap['Books.Update']()),
    data: {books}
  }).then(function(updatedBooks) {
    return updatedBooks;
  });
}
// ---------------- /End Point ------------------


module.exports = {
  getSocket: getSocket,
  emitWebSocket: emitWebSocket,
  onWebSocket: onWebSocket,
  offWebSocket: offWebSocket,
  downloadFile: downloadFile,
  getBooks: getBooks,
  hideBooks: hideBooks,
  getDistinctBookAttribute: getDistinctBookAttribute,
  requestDownload: requestDownload,
  isServerScanningForBooks: isServerScanningForBooks,
  doStartScanning: doStartScanning,
  requestBookDownload: requestBookDownload,
  updateBooks: updateBooks
};
