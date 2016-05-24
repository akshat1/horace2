'use strict';

/* istanbul ignore next */
const Client = {
  REQUEST_BOOKS          : 'client.action.fetch.books',
  REQUEST_SERVER_STATUS  : 'client.action.fetch.serverStatus',
  BOOK_SELECTION_CHANGED : 'client.event.bookSelectionChanged',
  SORT_CHANGED           : 'client.action.sort',
  SEARCH_CHANGED         : 'client.action.search',
  GROWL                  : 'client.event.growl'
};


/* istanbul ignore next */
const Server = {
  BOOK_READY_FOR_DOWNLOAD : 'websocket.bookReadyForDownload',
  REQUEST_BOOK_DOWNLOAD   : 'websocket.requestBookDownload',
  SCANNER_SCANSTARTED     : 'websocket.scannerStarted',
  SCANNER_SCANSTOPPED     : 'websocket.scannerStopped'
};


/* istanbul ignore next */
const IPC = {
  ERROR_OCCURRED      : 'horace.ipc.worker.errorOccurred',
  HELLOFROM_SCANNER   : 'horace.ipc.helloFrom.scanner',
  SCANNER_DOSCAN      : 'horace.ipc.scanner.doScan',
  SCANNER_SCANSTARTED : 'horace.ipc.scanner.scanStarted',
  SCANNER_SCANSTOPPED : 'horace.ipc.scanner.scanStopped',
  SCANNER_BOOKFOUND   : 'horace.ipc.scanner.bookFound'
};

/* istanbul ignore next */
module.exports = {
  Client : Client,
  Server : Server,
  IPC    : IPC
};