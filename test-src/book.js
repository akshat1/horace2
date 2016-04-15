'use strict';

var Chai = require('chai');
var Book = require('../app/book.js');
var reduceToSortString = Book.reduceToSortString;

var should = Chai.should();




describe('book', function() {
  it('tests that array of strings gets converted to a single sortable string', function() {
    var arr = ['AAA', 'BBB', 'CCC', 'ZZZ', 'DDD'].sort();
    arr.reduce(reduceToSortString)
      .should.equal('AAA_BBB_CCC_DDD_ZZZ');
  }); // it('tests that array of strings gets converted to a single sortable string'


  describe('book.setUpDisplayProperties', function() {
    it('tests that displayYear is set to "Unknown" when the value is -1 or null', function() {
      var b = new Book('test', '', null, -1, -1, null, null, 'test');
      b.displayYear.should.equal('Unknown');
      b = new Book('test', '', null, -1, null, null, null, 'test');
      return b.displayYear.should.equal('Unknown');
    }); // it('tests that displayYear is set to "Unknown" when the value is -1 or null'


    it('tests that displayYear is set to year when year has a valid value', function() {
      var b = new Book('test', '', null, -1, 1900, null, null, 'test');
      return b.displayYear.should.equal(1900);
    }); // it('tests that displayYear is set to year when year has a valid value'


    it('tests that sortProperties are correctly setup', function() {
      var srcAuthors = ['ZZZ', 'AAA', 'GGG'];
      var srcSubjects = ['ZZZ', 'AAA', 'JJJ'];
      var b = new Book('test', '', srcAuthors, -1, -1, srcSubjects, null, 'test');
      b.sortStringAuthors.should.equal('aaa_ggg_zzz');
      return b.sortStringSubjects.should.equal('aaa_jjj_zzz');
    }); // it('tests that sortProperties are correctly setup'
  }); // describe('book.setUpDisplayProperties'

}); // describe('book', function() {
