import * as Utils from './utils.js';
import _ from 'lodash';


function mapToLowerCase(a) {
  return (a||'').toLowerCase();
}

function reduceToSortString(previousValue, currentValue, index, array) {
  return (previousValue || '') + '_' + (currentValue || '');
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
    this.authors     = authors.map(mapToLowerCase);
    this.sizeInBytes = isNaN(sizeInBytes) ? -1 : parseInt(sizeInBytes);
    this.year        = isNaN(year) ? -1 : parseInt(year);
    this.subjects    = subjects.map(mapToLowerCase);
    this.publisher   = publisher.toLowerCase();
    this.adapterId   = adapterId;

    this.setUpDisplayProperties();
    this.setUpSortProperties();
  }

  setUpDisplayProperties() {
    this.displayYear = this.year === -1 ? 'Unknown' : this.year;
  }

  setUpSortProperties() {
    this.sortStringAuthors = this.authors.reduce(reduceToSortString, '');
    this.sortStringSubjects = this.subjects.reduce(reduceToSortString, '');
  }
}


export default Book;
