$Utils = require './utils.coffee'

###
Meant as a spec. Adapters may extend it.

id : simply path for now.
###
class Book
  constructor: (@id, @title, @authors, @sizeInBytes, @year, @subjects, @publisher, @adapterId) ->
    # Numeric id for indexing.
    @_id = $Utils.getHash @id

module.exports = Book
