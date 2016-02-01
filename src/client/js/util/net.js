'use strict';

/**
@module net
<p>
Abstractions of Horace server functions.
</p><p>
Provides both HTTP as well as Websocket related utils.
</p>
*/

import Http from './http.js';
import {Server as ServerEvents} from './../../../app/events.js';
import UrlMap from './../../../app/urls.js';

const ClientURLMap = UrlMap.Client;
window.ClientURLMap = ClientURLMap;

// -------------- Websockets stuff --------------
var socket = null;
export function getSocket() {
  if(!socket) {
    socket = window.io.connect(window.location.origin, {
      path: window.HoraceConf.socketIOURL
    });
  }
  return socket;
}


export function emitWebSocket(eventName, args) {
  getSocket().emit(eventName, args);
}


export function onWebSocket(eventName, callback) {
  getSocket().on(eventName, callback);
}


export function offWebSocket(eventName, callback) {
  getSocket().off(eventName, callback);
}

// ------------- /Websockets stuff --------------


// ----------------- End Point ------------------
export function downloadFile(url) {
  var frame = document.createElement('iframe');
  frame.className = 'h-download-frame';
  frame.height = '100px';
  frame.width = '100px';
  document.body.appendChild(frame);
  frame.src = url;
}


export function getBooks(pager, sort, filter) {
  return Http.post({
    url          : ClientURLMap['Books'](),
    responseType : Http.ResponseType.JSON,
    data         : {
      pager  : pager,
      sort   : sort,
      filter : filter
    }
  }).then(function(res) {
    return {
      books     : res.books,
      bookPager : res.pager,
      bookSort  : res.sort,
      filter    : res.filter
    };
  });
}


export function hideBooks(books) {
  console.log(ClientURLMap);
  return Http.get({
    url : ClientURLMap['Book.Hide'](books.map(function(b) {return b.id;}).join(',')),
    data: {}
  });
}


var _distinctValues = {};
export function getDistinctBookAttribute(columnName) {
  if (_distinctValues[columnName])
    return Promise.resolve(_distinctValues[columnName]);
  else
    return Http.get({
      url          : ClientURLMap['Books.Distinct'](columnName),
      responseType : Http.ResponseType.JSON
    }).then(function(values) {
      _distinctValues[columnName] = values;
      return values;
    });
}


export function requestDownload(book) {
  emitWebSocket(ServerEvents.REQUEST_BOOK_DOWNLOAD, {
    bookId: book.id
  });
}


export function isServerScanningForBooks() {
  return Http.get({
    url: ClientURLMap['Status.IsScanning'](),
    responseType: Http.ResponseType.JSON
  });
}


export function doStartScanning() {
  Http.get({
    url: ClientURLMap['Command.StartScan']()
  });
}
// ---------------- /End Point ------------------
