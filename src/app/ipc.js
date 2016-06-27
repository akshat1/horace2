'use strict';

const _ = require('lodash');
const IPC = require('node-ipc');
const {
  ID,
  Config: IPCConfig
} = require('./ipc-utils.js');
const ChildProcess = require('child_process');
const Config = require('./config.js');
const Winston = require('winston');
const Horace = require('./horace.js');
const {
  IPC: IPCEvents
} = require('./events');


const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: Config('horace.ipc-server.logLevel')
    }), new Winston.transports.File({
      filename: 'ipc-server.log'
    })
  ]
});


function handleHelloFromScanner() {
  if (Config('horace.scan.serverstart')) {
    logger.info('horace.scan.serverstart set to true. Scanning now.');
    return Horace.startScan();
  }
}


function handleError(data) {
  logger.error('Somebody had an error', data);
  return console.error(data);
}


function handleScanStarted() {
  Horace.setScanningForBooks(true);
  Horace._emit(ServerEvents.SCANNER_SCANSTARTED);
}


function handleScanStopped() {
  logger.info('Scaning Finished');
  Horace.setScanningForBooks(false);
  Horace.getBook();
  Horace._emit(ServerEvents.SCANNER_SCANSTOPPED);
}


function _ipcServer() {
  IPC.server.on(IPCEvents.HELLOFROM_SCANNER, handleHelloFromScanner);
  IPC.server.on(IPCEvents.ERROR_OCCURRED, handleError);
  IPC.server.on(IPCEvents.SCANNER_SCANSTARTED, handleScanStarted);
  IPC.server.on(IPCEvents.SCANNER_SCANSTOPPED, handleScanStopped);
}

_.merge(IPC.config, IPCConfig.Master);
IPC.serve(_ipcServer);
IPC.server.start();
ChildProcess.fork('./app/scanner.js');
