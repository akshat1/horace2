'use strict';

describe('horace', function(){
  describe('startScan', function() {
    it('tests that startScan returns a promise');
    it('tests that startScan broadcasts ipc event "IPCEvents.SCANNER_DOSCAN" with correct payload');
  });//describe('startScan', functio


  describe('getBooks', function() {
    it('tests that getBooks calls DB.getBooks with supplied opts');
  });//describe('getBooks', functio


  describe('getBook', function() {
    it('tests that getBook calls DB.getBook with supplied id');
  });//describe('getBook', functio


  describe('requestDownload', function() {
    it('tests that requestDownload uses previously obtained version from tmp location if one exists');
    it('tests that requestDownload calls Adapter.getBookForDownload with the book obtained from getBook');
    it('tests that requestDownload pipes readStream from Adapter.getBookForDownload into a writeStream to the tmp location');
    it('tests that requestDownload handles readStream.close by resolving with path to the tmp location ');
  });//describe('requestDownload', functio


  describe('getDistinctBookAttribute', function() {
    it('tests that getDistinctBookAttribute proxies DB.getDistinctBookAttribute');
  });//describe('getDistinctBookAttribute', functio
});