# See https://github.com/mfncooper/mockery/blob/master/examples/example1.js

$Chai      = require 'chai'
$Mockery   = require 'mockery'
$Sinon     = require 'sinon'
$Utils     = require '../app/utils.coffee'

should = $Chai.should()
expect = $Chai.expect

RequirePath = 
  Scanner : '../app/scanner.coffee'
  Adapter : './adapter.coffee'
  DB      : './db.coffee'
  FS      : 'graceful-fs'

TestPath = 'aye/bee/see'

TIMEOUT = 100


describe '#_scanPath', () ->
  testScannerShouldSaveRecognizedBook = () ->
    expectedBook = {'expected': 'book'}
    FakeAdapter = 
      getBook: (path) -> $Utils.toPromise expectedBook

    FakeDB =
      saveBook: $Sinon.spy()

    $Mockery.registerAllowable RequirePath.Scanner
    $Mockery.registerMock RequirePath.Adapter, FakeAdapter
    $Mockery.registerMock RequirePath.DB, FakeDB
    $Mockery.enable 
      useCleanCache      : true
      warnOnUnregistered : false

    $Scanner = require RequirePath.Scanner
    $Scanner.scanPath TestPath
      .then () ->
        FakeDB.saveBook.callCount.should.equal 1
        FakeDB.saveBook.firstCall.args[0].should.equal expectedBook
        $Mockery.deregisterAll()
        $Mockery.disable()

  it 'tests that scanPath saves a book recognized by an Adapter', testScannerShouldSaveRecognizedBook
  

  testScanPathCallsScanPathOnNonRecognition = () ->  
    FakeAdapter = 
      getBook: $Sinon.stub().returns $Utils.toPromise()

    FakeStat = 
      isDirectory: () -> false
    
    FakeFS =
      #stat = (path, cb) ->
      stat: $Sinon.stub().callsArgWith 1, null, FakeStat
    $Mockery.registerAllowable RequirePath.Scanner
    $Mockery.registerMock RequirePath.Adapter, FakeAdapter
    $Mockery.registerMock RequirePath.FS, FakeFS
    $Mockery.registerMock RequirePath.DB, {}
    $Mockery.enable
      useCleanCache      : true
      warnOnUnregistered : false
    $Scanner = require RequirePath.Scanner
    $Scanner.scanPath TestPath
      .then () ->
        FakeAdapter.getBook.callCount.should.equal 1
        FakeFS.stat.callCount.should.equal 1
        FakeFS.stat.firstCall.args[0].should.equal TestPath

        $Mockery.deregisterAll()
        $Mockery.disable()

  it 'tests that scanPath calls fs.stat when no adapter recognizes a path', testScanPathCallsScanPathOnNonRecognition
      

  testScanPathReadsDirectoryOnNonRecognition = () ->
    FakeAdapter = 
      getBook: $Sinon.stub().returns $Utils.toPromise()

    FakeStat = 
      isDirectory: () -> true

    FakeFS =
      stat: $Sinon.stub().callsArgWith 1, null, FakeStat
      readdir: $Sinon.stub().callsArgWith 1, null, []

    $Mockery.registerAllowable RequirePath.Scanner
    $Mockery.registerMock RequirePath.Adapter, FakeAdapter
    $Mockery.registerMock RequirePath.FS, FakeFS
    $Mockery.registerMock RequirePath.DB, {}
    $Mockery.enable
      useCleanCache      : true
      warnOnUnregistered : false

    $Scanner = require RequirePath.Scanner
    $Scanner.scanPath TestPath
      .then () ->
        FakeAdapter.getBook.callCount.should.equal 1
        FakeFS.stat.callCount.should.equal 1
        FakeFS.stat.firstCall.args[0].should.equal TestPath
        FakeFS.readdir.callCount.should.equal 1

        $Mockery.deregisterAll()
        $Mockery.disable()

  it 'tests that scanPath descends into a directory when no adapter recognizes it', testScanPathReadsDirectoryOnNonRecognition

