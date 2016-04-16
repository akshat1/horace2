/**
* Tests for app/adapter.js
*/

var Chai = require('chai');
var Mockery = require('mockery');
var Sinon = require('sinon');

var should = Chai.should();
var expect = Chai.expect;

const RequirePath = {
  Adapter  : '../app/adapter.js',
  Config   : './config.js',
  Adapter1 : 'Adapter1',
  Adapter2 : 'Adapter2',
  Adapter3 : 'Adapter3'
};


function makeAdapter(adapterId, alwaysReturnedBook) {
  return {
    id: adapterId,
    getAdapterId: function() {
      return adapterId;
    },
    getBook: Sinon.stub().returns(Promise.resolve(alwaysReturnedBook))
  };
}


function makeFakeConfig(defaultAdapters, adapters, logLevel) {
  return function(key) {
    var obj = {};
    obj['horace.adapters.logLevel'] = logLevel || 'error';
    obj['horace.defaultAdapters']   = defaultAdapters || [];
    obj['horace.adapters']          = adapters || [];
    return obj[key];
  };
}


describe('adapter', function() {
  var Adapter, oAdapter1, oAdapter2, oAdapter3;
  var bookExpectedFromAdapter2 = {label: 'bookExpectedFromAdapter2'};
  var bookExpectedFromAdapter3 = {label: 'bookExpectedFromAdapter3'};

  beforeEach(function() {
    oAdapter1 = makeAdapter('adapter1');
    oAdapter2 = makeAdapter('adapter2', bookExpectedFromAdapter2);
    oAdapter3 = makeAdapter('adapter3', bookExpectedFromAdapter3);
    var FakeConfig = makeFakeConfig([RequirePath.Adapter1, RequirePath.Adapter2, RequirePath.Adapter3])
    Mockery.registerAllowable(RequirePath.Adapter);
    Mockery.registerMock(RequirePath.Config, FakeConfig);
    Mockery.registerMock(RequirePath.Adapter1, oAdapter1);
    Mockery.registerMock(RequirePath.Adapter2, oAdapter2);
    Mockery.registerMock(RequirePath.Adapter3, oAdapter3);
    Mockery.enable({
      useCleanCache      : true,
      warnOnUnregistered : false
    });
    Adapter = require(RequirePath.Adapter);
  });


  afterEach(function() {
    Mockery.deregisterAll();
    Mockery.disable();
  });




  it('tests that toArray returns the adapter list', function() {
    var testArray = Adapter.toArray();
    // Remember the order of adapters is important
    testArray.should.be.instanceof(Array);
    testArray.length.should.equal(3);
    testArray[0].should.equal(oAdapter1);
    testArray[1].should.equal(oAdapter2);
    testArray[2].should.equal(oAdapter3);
  }); //it('tests that toArray returns the adapter list'




  describe('adapter.getAdapterForBook', function() {
    it('tests that getAdapterForBook returns with the appropriate adapter', function() {
      var testBook = {
        adapterId: oAdapter2.getAdapterId()
      };
      var receivedAdapter = Adapter.getAdapterForBook(testBook);
      receivedAdapter.should.equal(oAdapter2);
    }); // it('tests that getAdapterForBook returns with the appropriate adapter'


    it('tests that getAdapterForBook returns with null when no corresponding adapter is found', function() {
      var testBook = {
        adapterId: 'OOGABOOGA'
      };
      var receivedAdapter = Adapter.getAdapterForBook(testBook);
      expect(receivedAdapter).to.be.undefined
    }); // it('tests that getAdapterForBook returns with null when no corresponding adapter is found'
  }); // describe('adapter.getAdapterForBook'




  describe('adapter.getBook', function() {
    it('tests that getBook queries adapter with the supplied path', function() {
      var testPath = 'OOGABOOGA';
      return Adapter.getBook(testPath).then(function(book) {
        console.log('received book >> ', book);
        console.log('adapter1 call count ', oAdapter1.getBook.callCount);
        console.log('adapter2 call count ', oAdapter2.getBook.callCount);
        console.log('adapter3 call count ', oAdapter3.getBook.callCount);
        oAdapter1.getBook.callCount.should.equal(1);
        oAdapter1.getBook.firstCall.args[0].should.equal(testPath);
        oAdapter2.getBook.callCount.should.equal(1);
        oAdapter2.getBook.firstCall.args[0].should.equal(testPath);
        oAdapter3.getBook.callCount.should.equal(0);
      });
    }); // it('tests that getBook queries adapter with the supplied path'


    it('tests that getBook resolves with the first adapter supplied book', function() {
      var testPath = 'OOGABOOGA';
      return Adapter.getBook(testPath)
        .then(function(receivedBook) {
          receivedBook.should.equal(bookExpectedFromAdapter2);
        });
    });
  });
});
