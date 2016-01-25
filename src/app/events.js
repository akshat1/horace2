'use strict';

/* istanbul ignore next */
const Client = {
  TABLE_SET_SORT         : 'table.set.sort',
  BOOKS_SET_FILTER       : 'books.filter.set',
  BOOKS_SHOW_FILTER      : 'books.filter.show',
  BOOK_DOWNLOAD          : 'book.download',
  BOOK_HIDE              : 'book.hide',
  BOOK_EDIT              : 'book.edit',
  BOOK_SELECTION_CHANGED : 'book.selection.changed',
  SELECTION_CLEAR        : 'selection.clear',
  NOTIFICATION_DISMISS   : 'notification.dismiss'
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