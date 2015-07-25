$Utils = require './utils.coffee'

_ = require 'lodash'




###
Adapters may extend this class.

id : simply path for now.
###
class Book
  @makeSortStringFromArray: (arr) ->
    arr.sort()
      .join '_$_'


  constructor: (@path, title, authors = [], @sizeInBytes, year = -1, subjects = [], publisher = '', @adapterId) ->
    ### istanbul ignore next ###
    throw new Error 'adapterId must be a non-empty string' unless @adapterId and typeof @adapterId is 'string'
    # Numeric id for indexing.
    @id   = $Utils.getHash @path

    # strings should always be lower case.
    @title      = title.toLowerCase()
    @authors    = _.map authors, (a) -> a.toLowerCase()
    @subjects   = _.map subjects, (s) -> s.toLowerCase()
    @publisher  = publisher.toLowerCase()

    #year should always be numeric
    @year  = parseInt year

    @setUpDisplayProperties()
    @setUpSortProperties()


  setUpDisplayProperties: () ->
    @displayYear = if @year is -1 then 'Unknown' else @year


  setUpSortProperties: () ->
    @sortStringAuthors  = Book.makeSortStringFromArray @authors
    @sortStringSubjects = Book.makeSortStringFromArray @subjects


module.exports = Book
