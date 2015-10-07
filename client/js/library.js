"use strict";

var $C, $N, $PubSub, $ServerEvents, $Sorting, BookList, Library, SortColumn, SortDirection,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$N = require('./net.js');

$C = Compute;

$Sorting = require('../../app/sorting.js');

$ServerEvents = require('../../app/server-events.js');

$PubSub = require('./pubsub.js');

$N.on('ScanStarted', function() {
  console.debug('Scan Started');
  return console.debug(arguments);
});

SortColumn = $Sorting.SortColumn;

SortDirection = $Sorting.SortDirection;


/*
TODO: The sorting code is extremely verbose. Better to move it into a widget.
 */

BookList = (function() {
  function BookList() {
    this.getBooks = bind(this.getBooks, this);
    this.booksB = $C.oa([]);
    this.isBusyB = $C.o(false);
    this.pageSizeB = $C.o(24);
    this.currentPageNumberB = $C.o(1);
    this.totalBooksB = $C.o(-1);
    this.pageNextEnabledB = $C.from(this.currentPageNumberB, this.pageSizeB, this.totalBooksB, function(pageNumber, pageSize, totalBooks) {
      return (pageNumber * pageSize) < totalBooks;
    });
    this.pagePreviousEnabledB = $C.from(this.currentPageNumberB, function(pageNumber) {
      return pageNumber > 1;
    });
    this.currentSortColumnB = $C.o(null);
    this.currentSortDirectionB = $C.o(null);
    this.isSortedByTitleB = $C.from(this.currentSortColumnB, function(sCol) {
      return sCol === SortColumn.Title;
    });
    this.isSortedByYearB = $C.from(this.currentSortColumnB, function(sCol) {
      return sCol === SortColumn.Year;
    });
    this.isSortedByAdapterB = $C.from(this.currentSortColumnB, function(sCol) {
      return sCol === SortColumn.Adapter;
    });
    this.isSortedByAuthorsB = $C.from(this.currentSortColumnB, function(sCol) {
      return sCol === SortColumn.Authors;
    });
    this.isSortedBySubjectsB = $C.from(this.currentSortColumnB, function(sCol) {
      return sCol === SortColumn.Subjects;
    });
    this.isSortedDESCB = $C.from(this.currentSortDirectionB, function(sDir) {
      return sDir === SortDirection.DESC;
    });
    this.pageNextEnabledB.$fire();
    this.pagePreviousEnabledB.$fire();
    this.sortColumnClicked(SortColumn.Title);
    this.setupSocketListeners();
  }

  BookList.prototype.setupSocketListeners = function() {
    return $N.on($ServerEvents.BOOK_READY_FOR_DOWNLOAD, function(payload) {
      $PubSub.broadcast('book_download', {
        message: "Book ready for download <a href='" + payload.path + "'>here</a>.",
        timeout: -1
      });
      return console.debug("Book ready for download at %o", payload);
    });
  };

  BookList.prototype.getBooks = function(pageNumber) {
    var from, opts, p;
    this.isBusyB(true);
    from = (pageNumber - 1) * this.pageSizeB();
    opts = {
      from: from,
      numItems: this.pageSizeB(),
      sortColumnName: this.currentSortColumnB(),
      sortDirection: this.currentSortDirectionB()
    };
    p = $N.getBooks(opts);
    p["catch"]((function(_this) {
      return function(err) {
        alert(err);
        return _this.isBusyB(false);
      };
    })(this));
    return p.then((function(_this) {
      return function(result) {
        var books;
        books = result.books;
        _this.totalBooksB(result.totalItems);
        if (books.length) {
          _this.currentPageNumberB((result.from / _this.pageSizeB()) + 1);
        } else {
          console.warn('No Books');
        }
        _this.booksB(books);
        return _this.isBusyB(false);
      };
    })(this));
  };

  BookList.prototype.sortColumnClicked = function(newSortColumn) {
    if (newSortColumn === this.currentSortColumnB()) {
      this.currentSortDirectionB(SortDirection.flip(this.currentSortDirectionB()));
    } else {
      this.currentSortDirectionB(SortDirection.ASC);
      this.currentSortColumnB(newSortColumn);
    }
    return this.getBooks(this.currentPageNumberB());
  };

  BookList.prototype.pageNextC = function() {
    return this.getBooks(this.currentPageNumberB() + 1);
  };

  BookList.prototype.pagePreviousC = function() {
    return this.getBooks(this.currentPageNumberB() - 1);
  };

  BookList.prototype.sortByTitleC = function() {
    return this.sortColumnClicked(SortColumn.Title);
  };

  BookList.prototype.sortByYearC = function() {
    return this.sortColumnClicked(SortColumn.Year);
  };

  BookList.prototype.sortByAdapterC = function() {
    return this.sortColumnClicked(SortColumn.Adapter);
  };

  BookList.prototype.sortByAuthorsC = function() {
    return this.sortColumnClicked(SortColumn.Authors);
  };

  BookList.prototype.sortBySubjectsC = function() {
    return this.sortColumnClicked(SortColumn.Subjects);
  };

  BookList.prototype.downloadC = function(book) {
    return $N.requestDownload(book);
  };

  return BookList;

})();

Library = (function() {
  function Library() {
    this.bookList = new BookList();
  }

  return Library;

})();

module.exports = Library;