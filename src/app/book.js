var Utils = require('./utils.js');
var _ = require('lodash');


class Book {
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
  constructor(path, title, authors, sizeInBytes, year, subjects, publisher, adapterId) {
    if(!path)
      throw new Error('Can not create Book without path');
    if(!adapterId)
      throw new Error('Can not create Book without an adapterId');

    authors   = authors || [];
    year      = year || -1;
    subjects  = subjects || [];
    publisher = publisher || '';

    this.id          = Utils.getHash(path);
    this.path        = path;
    this.title       = title.trim();
    this.authors     = authors.map(Book.mapToLowerCase).sort();
    this.sizeInBytes = isNaN(sizeInBytes) ? -1 : parseInt(sizeInBytes);
    this.year        = isNaN(year) ? -1 : parseInt(year);
    this.subjects    = subjects.map(Book.mapToLowerCase).sort();
    this.publisher   = publisher.toLowerCase();
    this.adapterId   = adapterId;

    this.setUpDisplayProperties();
    this.setUpSortProperties();
  }

  setUpDisplayProperties() {
    this.displayYear = Book.yearToDisplayYear(this.year);
  }


  setUpSortProperties() {
    this.sortStringTitle = this.title.toLowerCase();
    this.sortStringAuthors = this.authors.reduce(Book.reduceToSortString, '');
    this.sortStringSubjects = this.subjects.reduce(Book.reduceToSortString, '');
  }


  static mongoFilter(opts, includeHidden) {
    opts = opts || {};
    var filter = {};
    if(!includeHidden)
      filter['isHidden'] = {'$ne': true};

    if (opts.adapterId && (opts.adapterId.length > 0)) {
      console.log(0);
      filter['adapterId'] = {
        '$in': opts.adapterId
      };
    }

    if (opts.displayYear && (opts.displayYear.length > 0)) {
      console.log(1);
      filter['year'] = {
        '$in': opts.displayYear.map(Book.displayYearToYear)
      };
    }

    if (opts.authors && (opts.authors.length > 0)) {
      console.log(2);
      filter['authors'] = {
        '$in': opts.authors
      };
    }

    return filter;
  }


  static distinguish(columnName, values) {
    switch (columnName) {
      case 'authors': return _.union(values);
      case 'subjects': return _.union(values);
      default: return values;
    }
  }


  static mapToLowerCase(a) {
    return (a||'').toLowerCase();
  }


  static reduceToSortString(previousValue, currentValue) {
    if(previousValue)
      return (previousValue || '') + '_' + (currentValue || '');
    else
      return currentValue;
  }


  static yearToDisplayYear(year) {
    return year === -1 ? 'Unknown' : year;
  }


  static displayYearToYear(displayYear) {
    return displayYear === 'Unknown' ? -1 : parseInt(displayYear);
  }


  static getSortColumnName(columnName) {
    switch (columnName) {
      case 'title'    : return 'sortStringTitle';
      case 'authors'  : return 'sortStringAuthors';
      case 'subjects' : return 'sortStringSubjects';
      default         : return columnName;
    }
  }
}


module.exports = Book;
