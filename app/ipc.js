var Event, ID;

ID = {
  HORACE: 'master',
  SCANNER: 'worker.scanner'
};

Event = {
  ERROR_OCCURRED: 'horace.ipc.worker.errorOccurred',
  HELLOFROM_SCANNER: 'horace.ipc.helloFrom.scanner',
  SCANNER_DOSCAN: 'horace.ipc.scanner.doScan',
  SCANNER_SCANSTARTED: 'horace.ipc.scanner.scanStarted',
  SCANNER_SCANSTOPPED: 'horace.ipc.scanner.scanStopped',
  SCANNER_BOOKFOUND: 'horace.ipc.scanner.bookFound'
};

module.exports = {
  ID: ID,
  Event: Event
};