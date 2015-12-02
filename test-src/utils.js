'use strict';

import Chai from 'chai';
import {getHash, findPromise, forEachPromise} from '../app/utils.js';


var should = Chai.should();
var expect = Chai.expect;
var assert = Chai.assert;




describe('utils.js', function() {

  describe('utils.getHash', function() {
    it('tests that getHash throws an error if invoked without arguments', function() {
      expect(getHash).to.throw('Missing argument to generate hash from');
    });//it('tests that getHash throws an error if invoked without arguments', functio

    it('tests that getHash throws an error if invoked with empty string', function() {
      var invoker = function() {
        return getHash('');
      }
      expect(invoker).to.throw('Missing argument to generate hash from');
    });//it('tests that getHash throws an error if invoked with empty string', functio

    it('tests getHash for known values', function() {
      getHash('test string 0').should.equal(-1868213957);
      getHash('TEST STRING 0').should.equal(-1554899621);
    });//it('tests getHash for known values', functio
  });//describe('getHash', functio


  describe('utils.findPromise', function() {
    it('tests that findPromise returns null if nothing satisfies fnCondition', function() {
      var testArr = ['zero', 'one', 'two', 'three', 'four'];
      var fnGetter = function(str, index) {
        return Promise.resolve('no match');
      };

      var fnCondition = function() {
        return false;
      }

      return findPromise(testArr, fnGetter, fnCondition)
        .then(function(result) {
          assert.isNull(result);
        });
    });//it('tests that findPromise returns null if nothing satisfies fnCondition', functio


    it('tests that findPromise returns the value which satisfies fnCondition', function() {
      var testArr = ['zero', 'one', 'two', 'three', 'four'];
      var fnGetter = function(str, index) {
        return new Promise(function(resolve, reject) {
          resolve(str === 'three' ? '2+1' : 'blah');
        });
      };

      var fnCondition = function(str) {
        return str === '2+1';
      };

      return findPromise(testArr, fnGetter, fnCondition)
        .then(function(result) {
          return result.should.equal('2+1');
        });//.then(function(resu
    });//it('tests that findPromise returns the value which satisfies fnCondition', functio

    it('tests that findPromise rejects appropriately if any promise fails');
    it('tests that findPromise calls fnGetter for each value in sequence until it encounters the one which passes fnCondition');
  });//describe('utils.findPromise', functio


  describe('utils.forEachPromise', function() {
    it('tests that forEachPromise calls fn for each value of the arr');
    it('tests that forEachPromise resolves with the array constructed using resolution values of fn for arr');
    it('tests that forEachPromise never calls fn[i + 1] before fn[i] is fulfilled');
  });//describe('utils.forEachPromise', functio

}); //describe('utils.js', functio


