
$N = require './net.coffee'
$C = Compute

$N.on 'ScanStarted', () ->
  console.debug 'Scan Started'
  console.debug arguments


class BookList
  constructor: () ->
    @pageSizeB = $C.o 24 # TODO: calculate optimum number of rows
    @currentPageNumberB = $C.o 1
    @isBusyB = $C.o false
    @booksB = $C.oa []
    @getBooks @currentPageNumberB()
    @totalBooksB = $C.o -1
    @pageNextEnabledB = $C.from @currentPageNumberB, @pageSizeB, @totalBooksB, (pageNumber, pageSize, totalBooks) ->
      (pageNumber * pageSize) + pageSize < totalBooks
    @pagePreviousEnabledB = $C.from @currentPageNumberB, (pageNumber) ->
      pageNumber > 1
    @pageNextEnabledB.$fire()
    @pagePreviousEnabledB.$fire()


  getBooks: (pageNumber) ->
    @isBusyB true
    from = (pageNumber - 1) * @pageSizeB()
    opts =
      from     : from
      numItems : @pageSizeB()
    p = $N.getBooks opts
    p.catch (err) =>
      alert err
      @isBusyB false

    p.then (result) =>
      books = result.books
      @totalBooksB result.totalItems
      if books.length
        @currentPageNumberB (result.from / @pageSizeB()) + 1
      else
        console.warn 'No Books'
      @booksB books
      @isBusyB false


  pageNextC: () ->
    @getBooks @currentPageNumberB() + 1


  pagePreviousC: () ->
    @getBooks @currentPageNumberB() - 1


class Library
  constructor: () ->
    @bookList = new BookList()



module.exports = Library
