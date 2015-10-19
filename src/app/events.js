'use strict';

const HoraceEvents = {
  Server : {
    BOOK_READY_FOR_DOWNLOAD : 'horace.websocket.bookReadyForDownload',
    REQUEST_BOOK_DOWNLOAD   : 'horace.websocket.requestBookDownload',
    SCANNER_SCANSTARTED     : 'horace.websocket.scannerStarted',
    SCANNER_SCANSTOPPED     : 'horace.websocket.scannerStopped'
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