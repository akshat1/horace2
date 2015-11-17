'use strict';

const HoraceEvents = {
  Client : {
    PAGER_SET_PAGE   : 'pager.set.page',
    TABLE_SET_SORT   : 'table.set.sort',
    BOOKS_SET_FILTER : 'books.filter.set',
    BOOKS_SHOW_FILTER: 'books.filter.show',
    DOWNLOAD_BOOK    : 'download.book'
  },

  Server : {
    BOOK_READY_FOR_DOWNLOAD : 'websocket.bookReadyForDownload',
    REQUEST_BOOK_DOWNLOAD   : 'websocket.requestBookDownload',
    SCANNER_SCANSTARTED     : 'websocket.scannerStarted',
    SCANNER_SCANSTOPPED     : 'websocket.scannerStopped'
  },

  IPC : {
    ERROR_OCCURRED      : 'horace.ipc.worker.errorOccurred',
    HELLOFROM_SCANNER   : 'horace.ipc.helloFrom.scanner',
    SCANNER_DOSCAN      : 'horace.ipc.scanner.doScan',
    SCANNER_SCANSTARTED : 'horace.ipc.scanner.scanStarted',
    SCANNER_SCANSTOPPED : 'horace.ipc.scanner.scanStopped',
    SCANNER_BOOKFOUND   : 'horace.ipc.scanner.bookFound'
  }
}

export default HoraceEvents;