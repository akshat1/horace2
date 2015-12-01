'use strict';

import Chai from 'chai';
import * as HUrls from '../app/urls.js';

var should = Chai.should();
var expect = Chai.expect();

describe('URLS.getClientFunction', function() {
  it('tests that getClientFunction returns a function', function() {
    var testValue = HUrls.getClientFunction('a', 'b');
    (typeof testValue).should.equal('function');
  });

  it('tests that getClientFunction returns a function which handles non parametrized urls', function() {
    var clientFunction = HUrls.getClientFunction('/a', '/b');
    clientFunction().should.equal('/a/b');
  });

  it('tests that getClientFunction returns a function which returns the original URL when no params are specified', function() {
    var clientFunction = HUrls.getClientFunction('/a', '/b/:param0/:param1');
    clientFunction().should.equal('/a/b/:param0/:param1');
  });

  it('tests that getClientFunction returns a function which correctly handles urls and params', function() {
    var clientFunction = HUrls.getClientFunction('/testApi', '/dir0/dir1/:param0/:param1');
    var actualURL = clientFunction('foo', 'bar');
    var expectedURL = '/testApi/dir0/dir1/foo/bar';
    actualURL.should.equal(expectedURL);
  })
});


describe('URLS.register', function() {
  it('tests register with string path', function() {
    var serverMap = {};
    var clientMap = {};
    HUrls.register('test.key', '/bar/baz/:param0/:param1', '/foo', serverMap, clientMap);
    serverMap['test.key'].should.equal('/bar/baz/:param0/:param1');
    var testVal = clientMap['test.key'];
    (typeof testVal).should.equal('function');
    testVal('alpha', 'beta').should.equal('/foo/bar/baz/alpha/beta');
  });

  it('tests register with function path', function() {
    var serverMap = {};
    var clientMap = {};
    var expectedFunction = function() {
      return 'boo';
    };
    HUrls.register('test.key', expectedFunction, '/foo', serverMap, clientMap);
    serverMap['test.key'].should.equal(expectedFunction);
    clientMap['test.key'].should.equal(expectedFunction);
  });
});
