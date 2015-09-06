###
# Tests for adapter.coffee
###

$Chai      = require 'chai'
$Mockery   = require 'mockery'
$Sinon     = require 'sinon'
$Utils     = require '../app/utils.coffee'

should = $Chai.should()
expect = $Chai.expect

RequirePath = 
  Adapter  : '../app/adapter.coffee'
  Config   : './config.coffee'
  Adapter1 : 'Adapter1'
  Adapter2 : 'Adapter2'
  Adapter3 : 'Adapter3'


makeAdapter = (adapterId, alwaysReturnedBook) ->
  id           : adapterId
  getAdapterId : () -> adapterId
  getBook      : $Sinon.stub().returns $Utils.toPromise alwaysReturnedBook


makeFakeConfig = (defaultAdapters = [], adapters = [], logLevel = 'error') ->
  return (key) ->
    if key is 'horace.adapters.logLevel'
      logLevel

    else if key is 'horace.defaultAdapters'
      defaultAdapters

    else if key is 'horace.adapters'
      adapters


describe 'adapter', () ->
  $Adapter = oAdapter1 = oAdapter2 = oAdapter3 = null
  bookExpectedFromAdapter2 = {}
  bookExpectedFromAdapter3 = {}

  beforeEach () ->
    oAdapter1  = makeAdapter 'adapter1'
    oAdapter2  = makeAdapter 'adapter2', bookExpectedFromAdapter2
    oAdapter3  = makeAdapter 'adapter3', bookExpectedFromAdapter3
    FakeConfig = makeFakeConfig [RequirePath.Adapter1, RequirePath.Adapter2, RequirePath.Adapter3]    
    $Mockery.registerAllowable RequirePath.Adapter
    $Mockery.registerMock RequirePath.Config, FakeConfig
    $Mockery.registerMock RequirePath.Adapter1, oAdapter1
    $Mockery.registerMock RequirePath.Adapter2, oAdapter2
    $Mockery.registerMock RequirePath.Adapter3, oAdapter3

    $Mockery.enable
      useCleanCache      : true
      warnOnUnregistered : false

    $Adapter = require RequirePath.Adapter


  afterEach () ->
    $Mockery.deregisterAll()
    $Mockery.disable()


  describe 'adapter.toArray', () ->
    it 'tests that toArray returns the adapter list', () ->
      testArray = $Adapter.toArray()
      # Remember the order of adapters is important
      testArray.should.be.instanceof Array
      testArray.length.should.equal 3
      testArray[0].should.equal oAdapter1
      testArray[1].should.equal oAdapter2
      testArray[2].should.equal oAdapter3


  describe 'adapter.getAdapterForBook', () ->
    it 'tests that getAdapterForBook returns with the appropriate adapter', () ->
      testBook = 
        adapterId: oAdapter2.getAdapterId()

      receivedAdapter = $Adapter.getAdapterForBook testBook
      receivedAdapter.should.equal oAdapter2

    it 'tests that getAdapterForBook returns with null when no corresponding adapter is found', () ->
      testBook = 
        adapterId: 'OOGABOOGA'

      receivedAdapter = $Adapter.getAdapterForBook testBook
      expect(receivedAdapter).to.be.undefined


  describe 'adapter.getBook', () ->
    it 'tests that getBook queries adapter with the supplied path', () ->
      testPath = 'OOGABOOGA'
      $Adapter.getBook testPath
      oAdapter1.getBook.callCount.should.equal 1
      oAdapter1.getBook.firstCall.args[0].should.equal testPath
      oAdapter2.getBook.callCount.should.equal 1
      oAdapter2.getBook.firstCall.args[0].should.equal testPath
      oAdapter3.getBook.callCount.should.equal 1
      oAdapter3.getBook.firstCall.args[0].should.equal testPath

    it 'tests that getBook resolves with the first adapter supplied book', () ->
      testPath = 'OOGABOOGA'
      $Adapter.getBook testPath
        .then (receivedBook) ->
          receivedBook.should.equal bookExpectedFromAdapter2


  describe 'adapter.getBookForDownload', () ->
    it 'tests that getBookForDownload queries adapter with the supplied path'
    it 'tests that getBookForDownload resolves with the first adapter supplied book'









