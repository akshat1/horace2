$Chai = require 'chai'
$Book = require '../app/book.coffee'

should = $Chai.should()
expect = $Chai.expect()

describe 'book', () ->
  describe 'book.makeSortStringFromArray', () ->
    it 'tests that array of strings gets converted to a single sortable string', () ->
      arr = ['AAA', 'BBB', 'CCC', 'ZZZ', 'DDD']
      $Book.makeSortStringFromArray arr
        .should.equal 'AAA_$_BBB_$_CCC_$_DDD_$_ZZZ'


  describe 'book.setUpDisplayProperties', () ->
    it 'tests that displayYear is set to "Unknown" when the value is -1 or null', () ->
      b = new $Book 'test', '', null, -1, -1, null, null, 'test'
      b.displayYear.should.equal 'Unknown'

      b = new $Book 'test', '', null, -1, null, null, null, 'test'
      b.displayYear.should.equal 'Unknown'

    it 'tests that displayYear is set to year when year has a valid value', () ->
      b = new $Book 'test', '', null, -1, 1900, null, null, 'test'
      b.displayYear.should.equal 1900

    it 'tests that sortProperties are correctly setup', () ->
      srcAuthors = ['ZZZ', 'AAA']
      srcSubjects = ['ZZZ', 'AAA']
      b = new $Book 'test', '', srcAuthors, -1, -1, srcSubjects, null, 'test'
      b.sortStringAuthors.should.equal 'aaa_$_zzz'
      b.sortStringSubjects.should.equal 'aaa_$_zzz'
