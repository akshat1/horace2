# Enumerated IDs
ID = 
  HORACE  : 'master'
  SCANNER : 'worker.scanner'


# Enumerated IPC events
Event =
  # Events broadcast from Master

  # General Events
  # Expected payload if a JSON containing the error as error property
  ERROR_OCCURRED : 'horace.ipc.worker.errorOccurred'
  
  # Handshake / hello events
  HELLOFROM_SCANNER : 'horace.ipc.helloFrom.scanner'
  
  # Events TO Scanner to DO somethinf
  SCANNER_DOSCAN      : 'horace.ipc.scanner.doScan'
  SCANNER_SCANSTARTED : 'horace.ipc.scanner.scanStarted'
  SCANNER_SCANSTOPPED : 'horace.ipc.scanner.scanStopped'
  SCANNER_BOOKFOUND   : 'horace.ipc.scanner.bookFound'


module.exports =
  ID    : ID
  Event : Event