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


makeAdapter = (adapterId) ->
  getAdapterId: () -> adapterId


makeFakeConfig = (defaultAdapters = [], adapters = [], logLevel = 'error') ->
  return (key) ->
    if key is 'horace.adapters.logLevel'
      logLevel

    else if key is 'horace.defaultAdapters'
      defaultAdapters

    else if key is 'horace.adapters'
      adapters


describe '#_toArray', () ->
  it 'tests that toArray returns the adapter list', () ->
    oAdapter1 = makeAdapter 'Adapter1'
    oAdapter2 = makeAdapter 'Adapter2'
    oAdapter3 = makeAdapter 'Adapter3'
    FakeConfig = makeFakeConfig [RequirePath.Adapter1, RequirePath.Adapter2, RequirePath.Adapter3]
    $Mockery.registerAllowable RequirePath.Adapter
    $Mockery.registerMock RequirePath.Config, FakeConfig
    $Mockery.registerMock RequirePath.Adapter1, oAdapter1
    $Mockery.registerMock RequirePath.Adapter2, oAdapter2
    $Mockery.registerMock RequirePath.Adapter3, oAdapter3

    $Mockery.enable
      useCleanCache      : true
      warnOnUnregistered : false

    $Adapter = require RequirePath.Adapter;
    testArray = $Adapter.toArray();
    # Remember the order of adapters is important
    testArray.should.be.instanceof(Array);
    testArray.length.should.equal(3);
    testArray[0].should.equal(oAdapter1);
    testArray[1].should.equal(oAdapter2);
    testArray[2].should.equal(oAdapter3);
    #expect($Adapter.toArray()).to.have.members([oAdapter1, oAdapter2, oAdapter3]);
