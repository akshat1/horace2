import * as Utils from './utils.js';
import _ from 'lodash';


function mapToLowerCase(a) {
  return (a||'').toLowerCase();
}

function reduceToSortString(previousValue, currentValue, index, array) {
  return (previousValue || '') + '_' + (currentValue || '');
}


function yearToDisplayYear(year) {
  return year === -1 ? 'Unknown' : year;
}


function displayYearToYear(displayYear) {
  return displayYear === 'Unknown' ? -1 : parseInt(displayYear);
}


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
    this.title       = title;
    this.authors     = authors.map(mapToLowerCase).sort();
    this.sizeInBytes = isNaN(sizeInBytes) ? -1 : parseInt(sizeInBytes);
    this.year        = isNaN(year) ? -1 : parseInt(year);
    this.subjects    = subjects.map(mapToLowerCase);
    this.publisher   = publisher.toLowerCase();
    this.adapterId   = adapterId;

    this.setUpDisplayProperties();
    this.setUpSortProperties();
  }

  setUpDisplayProperties() {
    this.displayYear = yearToDisplayYear(this.year);
  }


  setUpSortProperties() {
    this.sortStringAuthors = this.authors.reduce(reduceToSortString, '');
    this.sortStringSubjects = this.subjects.reduce(reduceToSortString, '');
  }


  static mongoFilter(opts) {
    opts = opts || {};
    console.log('mongoFilter::', opts);
    var filter = {};
    console.log('opts.displayYear >> ', opts.displayYear);
    if (opts.adapterId && (opts.adapterId.length > 0)) {
      console.log(0);
      filter['adapterId'] = {
        '$in': opts.adapterId
      };
    }

    if (opts.displayYear && (opts.displayYear.length > 0)) {
      console.log(1);
      filter['year'] = {
        '$in': opts.displayYear.map(displayYearToYear)
      }
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
}


export default Book;
