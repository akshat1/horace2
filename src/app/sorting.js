'use strict';
/**
 * @module sorting
 */
export const SortColumn = {
  Title: 'title',
  Year: 'year',
  Adapter: 'adapterId',
  Authors: 'sortStringAuthors',
  Subjects: 'sortStringSubjects'
};

export const SortDirection = {
  ASC: 'ascending',
  DESC: 'descending',
  flip: function(sDir) {
    if (sDir === this.ASC) {
      return this.DESC;
    } else {
      return this.ASC;
    }
  }
};
