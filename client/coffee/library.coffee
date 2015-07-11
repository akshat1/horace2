
$N = require './net.coffee'
$C = Compute
$Sorting = require '../../app/sorting.coffee'


$N.on 'ScanStarted', () ->
  console.debug 'Scan Started'
  console.debug arguments


SortColumn    = $Sorting.SortColumn
SortDirection = $Sorting.SortDirection


###
TODO: The sorting code is extremely verbose. Better to move it into a widget.
###
class BookList
  constructor: () ->
    @booksB               = $C.oa []
    @isBusyB              = $C.o false

    # pagination.
    @pageSizeB            = $C.o 24 # TODO: calculate optimum number of rows
    @currentPageNumberB   = $C.o 1
    @totalBooksB          = $C.o -1
    @pageNextEnabledB     = $C.from @currentPageNumberB, @pageSizeB, @totalBooksB, (pageNumber, pageSize, totalBooks) -> (pageNumber * pageSize) < totalBooks
    @pagePreviousEnabledB = $C.from @currentPageNumberB, (pageNumber) -> pageNumber > 1

    # sorting
    @currentSortColumnB    = $C.o null
    @currentSortDirectionB = $C.o null
    @isSortedByTitleB      = $C.from @currentSortColumnB, (sCol) -> sCol is SortColumn.Title
    @isSortedByYearB       = $C.from @currentSortColumnB, (sCol) -> sCol is SortColumn.Year
    @isSortedByAdapterB    = $C.from @currentSortColumnB, (sCol) -> sCol is SortColumn.Adapter
    @isSortedByAuthorsB    = $C.from @currentSortColumnB, (sCol) -> sCol is SortColumn.Authors
    @isSortedBySubjectsB   = $C.from @currentSortColumnB, (sCol) -> sCol is SortColumn.Subjects
    @isSortedDESCB         = $C.from @currentSortDirectionB, (sDir) ->
      console.debug "Sort Direction: #{sDir}"
      sDir is SortDirection.DESC

    # get set
    # @getBooks = _.debounce @getBooks, 25
    @pageNextEnabledB.$fire()
    @pagePreviousEnabledB.$fire()

    # go
    @sortColumnClicked SortColumn.Title
    # @getBooks @currentPageNumberB()


  getBooks: (pageNumber) =>
    @isBusyB true
    from = (pageNumber - 1) * @pageSizeB()
    opts =
      from           : from
      numItems       : @pageSizeB()
      sortColumnName : @currentSortColumnB()
      sortDirection  : @currentSortDirectionB()
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


  sortColumnClicked: (newSortColumn) ->
    if newSortColumn is @currentSortColumnB()
      @currentSortDirectionB SortDirection.flip @currentSortDirectionB()

    else
      @currentSortDirectionB SortDirection.ASC
      @currentSortColumnB newSortColumn

    @getBooks @currentPageNumberB()


  pageNextC: () -> @getBooks @currentPageNumberB() + 1


  pagePreviousC: () -> @getBooks @currentPageNumberB() - 1


  sortByTitleC: () -> @sortColumnClicked SortColumn.Title


  sortByYearC: () -> @sortColumnClicked SortColumn.Year


  sortByAdapterC: () -> @sortColumnClicked SortColumn.Adapter


  sortByAuthorsC: () -> @sortColumnClicked SortColumn.Authors


  sortBySubjectsC: () -> @sortColumnClicked SortColumn.Subjects




class Library
  constructor: () ->
    @bookList = new BookList()



module.exports = Library
