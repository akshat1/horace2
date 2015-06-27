###
Meant as a spec. Adapters may extend it.

id : simply path for now.
###
class Book
  constructor: (@id, @title, @authors, @sizeInBytes, @subjects, @publisher, @adapterId) ->

module.exports = Book
