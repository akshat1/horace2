$Utils = require './utils.coffee'

_ = require 'lodash'


makeSortStringFromArray = (arr) ->
  arr.sort()
    .join '_$_'

###
Meant as a spec. Adapters may extend it.

id : simply path for now.
###
class Book
  constructor: (@path, title, authors = [], @sizeInBytes, year = -1, subjects = [], publisher = '', @adapterId) ->
    # Numeric id for indexing.
    @id   = $Utils.getHash @path

    # strings should always be lower case.
    @title      = title.toLowerCase()
    @authors    = _.map authors, (a) -> a?.toLowerCase() or ''
    @subjects   = _.map subjects, (s) -> s?.toLowerCase() or ''
    @publisher  = publisher.toLowerCase()

    #year should always be numeric
    @year  = parseInt year


  setUpDisplayProperties: () ->
    @displayYear = if @year is -1 then 'Unknown' else @year


  setUpSortProperties: () ->
    @sortStringAuthors  = makeSortStringFromArray @authors
    @sortStringSubjects = makeSortStringFromArray @subjects


module.exports = Book
