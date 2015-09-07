$Chai      = require 'chai'
$Mockery   = require 'mockery'
#$Sinon     = require 'sinon'
#$Utils     = require '../app/utils.coffee'

should = $Chai.should()
expect = $Chai.expect

$TxtAdapter = null

RequirePath =
  TxtAdapter: '../../app/adapters/txt-adapter.coffee'




describe 'adapters/txt-adapter', () ->
  beforeEach () ->
    $Mockery.registerAllowable RequirePath.TxtAdapter
    $Mockery.enable
      useCleanCache      : true
      warnOnUnregistered : false

    $TxtAdapter = require RequirePath.TxtAdapter


  afterEach () ->
    $Mockery.deregisterAll()
    $Mockery.disable()


  describe 'getAdapterId', () ->
    it 'tests that it returns the correct adapter id', () ->
      $TxtAdapter.getAdapterId().should.equal 'horace.txt'


  describe 'getBook', () ->
    it 'tests that getBook resolves with a Book object with the correct values when given a path to a text file'
    it 'tests that getBook resolves with undefined when given a non text file'


  describe 'isTextFile', () ->
    it 'tests that isTextFile resolves with false for a non-file path'
    it 'tests that isTextFile resolves with false for a file which doesnt end in .txt'
    it 'tests that isTextFile resolves with true for a .txt file'


  describe 'getTitle', () ->
    it 'tests that getTitle returns the title of the text'

  describe 'getAuthors', () ->
    it 'tests that getAuthors returns an array of string author names'

  describe 'getSizeInBytes', () ->
    it 'tests that getSizeInBytes resolves with the number of bytes'

  describe 'getYear', () ->
    it 'tests that getYear returns the numeric year of publication of a text'

  describe 'getSubjects', () ->
    it 'tests that getSubjects returns an array of string subjects'

  describe 'getPublisher', () ->
    it 'tests that getPublisher returns the string publisher name'
