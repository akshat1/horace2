/**
 * Base book class
 */
var $Utils, Book, _;

$Utils = require('./utils.js');

_ = require('lodash');

Book = (function() {
  Book.makeSortStringFromArray = function(arr) {
    return arr.sort().join('_$_');
  };


  /**
   * Adapters may extend this class in order to add custom data
   * @constructor Book
   * @param {string} path
   * @param {string} title
   * @param {Array} authors
   * @param {Number} sizeInBytes
   * @param {Number} year
   * @param {Array} subjects
   * @param {string} publisher
   * @param {string} adapterId
   */

  function Book(path, title, authors, sizeInBytes, year, subjects, publisher, adapterId) {
    this.path = path;
    if (authors == null) {
      authors = [];
    }
    this.sizeInBytes = sizeInBytes;
    if (year == null) {
      year = -1;
    }
    if (subjects == null) {
      subjects = [];
    }
    if (publisher == null) {
      publisher = '';
    }
    this.adapterId = adapterId;

    /* istanbul ignore next */
    if (!(this.adapterId && typeof this.adapterId === 'string')) {
      throw new Error('adapterId must be a non-empty string');
    }
    this.id = $Utils.getHash(this.path);
    this.title = title.toLowerCase();
    this.authors = _.map(authors, function(a) {
      return (a || '').toLowerCase();
    });
    this.subjects = _.map(subjects, function(s) {
      return (s || '').toLowerCase();
    });
    this.publisher = publisher.toLowerCase();
    this.year = parseInt(year);
    this.setUpDisplayProperties();
    this.setUpSortProperties();
  }

  Book.prototype.setUpDisplayProperties = function() {
    return this.displayYear = this.year === -1 ? 'Unknown' : this.year;
  };

  Book.prototype.setUpSortProperties = function() {
    this.sortStringAuthors = Book.makeSortStringFromArray(this.authors);
    return this.sortStringSubjects = Book.makeSortStringFromArray(this.subjects);
  };

  return Book;

})();

module.exports = Book;