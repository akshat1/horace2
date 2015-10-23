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

import { PagerModel, SortModel } from './../model/library-model.js';

const ServerEvents = HoraceEvents.Server;
const ClientURLMap = UrlMap.Client;
window.ClientURLMap = ClientURLMap;

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


//TODO: Make server accept these individually
function _getBooksQuery(pager, sort, filter) {
  return {
    currentPage   : pager.currentPage,
    pageSize      : pager.pageSize,
    sortColumn    : sort.columnName,
    sortAscending : sort.isAscending,
    filter        : filter
  }
}


export function getBooks(pager, sort, filter) {
  return Http.post({
    url          : ClientURLMap['Books'](),
    responseType : Http.ResponseType.JSON,
    data         : _getBooksQuery(pager, sort, filter)
  }).then(function(res) {
    let pager = new PagerModel(parseInt(res.currentPage), parseInt(res.pageSize), parseInt(res.maxPages));
    let sort  = new SortModel(res.sortColumn, res.sortAscending);
    return {
      books     : res.books,
      bookPager : pager,
      bookSort  : sort,
      filter    : res.filter
    };
  });
}


export function getDistinctBookAttribute(columnName) {
  return Http.get({
    url          : ClientURLMap['Books.Distinct'](columnName),
    responseType : Http.ResponseType.JSON
  });
}


export function getDistinctBookAdapters() {
  return getDistinctBookAttribute('adapterId');
}


export function getDistinctBookAuthor() {
  return getDistinctBookAttribute('authors');
}


export function getDistinctBookSubject() {
  return getDistinctBookAttribute('subjects');
}


export function getDistinctBookYear() {
  return getDistinctBookAttribute('year');
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
