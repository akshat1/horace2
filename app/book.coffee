###*
# Base book class
###

$Utils = require './utils.coffee'

_ = require 'lodash'




class Book
  @makeSortStringFromArray: (arr) ->
    arr.sort()
      .join '_$_'

  ###*
  # Adapters may extend this class in order to add custom data
  # @constructor Book
  # @param {string} path
  # @param {string} title
  # @param {Array} authors
  # @param {Number} sizeInBytes
  # @param {Number} year
  # @param {Array} subjects
  # @param {string} publisher
  # @param {string} adapterId
  ###
  constructor: (@path, title, authors = [], @sizeInBytes, year = -1, subjects = [], publisher = '', @adapterId) ->
    ### istanbul ignore next ###
    throw new Error 'adapterId must be a non-empty string' unless @adapterId and typeof @adapterId is 'string'
    # Numeric id for indexing.
    @id   = $Utils.getHash @path

    # strings should always be lower case.
    @title      = title.toLowerCase()
    # Sometimes some of these are undefined
    @authors    = _.map authors, (a) -> (a or '').toLowerCase()
    @subjects   = _.map subjects, (s) -> (s or '').toLowerCase()
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
