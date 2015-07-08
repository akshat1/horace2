
$N = require './net.coffee'
$C = Compute

$N.on 'ScanStarted', () ->
  console.debug 'Scan Started'
  console.debug arguments


class Library
  constructor: () ->
    @booksB = $C.oa []

    @getBooks()


  getBooks: () ->
    p = $N.getBooks()
    p.catch (err) -> alert err
    p.then (books) =>
      @booksB books


  columnHeaderClickedC: () =>
    console.log arguments


module.exports = Library
