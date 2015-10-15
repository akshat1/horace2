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
import _ from 'lodash';
import HoraceEvents from './../../../app/events.js';
import UrlMap from './../../../app/urls.js';


const ServerEvents = HoraceEvents.Server;
const ClientURLMap = UrlMap.Client;

// -------------- Websockets stuff --------------
var socket = null
export function getSocket() {
  if(!socket) {
    socket = io.connect(window.location.origin, {
      path: HoraceConf.socketIOURL
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
export function downloadFile(url, success) {
  var frame = document.createElement('iframe');
  frame.className = 'h-download-frame';
  frame.height = '100px';
  frame.width = '100px';
  document.body.appendChild(frame);
  frame.src = url;
}


export function getBooks(query) {
  return Http.get({
    url          : ClientURLMap['Books'],
    responseType : Http.ResponseType.JSON,
    data         : query
  });
}


export function requestDownload(book) {
  emitWebSocket(ServerEvents.REQUEST_BOOK_DOWNLOAD, {
    bookId: book.id
  });
}


export function isServerScanningForBooks() {
  return Http.get({
    url: ClientURLMap['Status.IsScanning'],
    responseType: Http.ResponseType.JSON
  });
}


export function doStartScanning() {
  Http.get({
    url: ClientURLMap['Command.StartScan']
  });
}
// ---------------- /End Point ------------------
