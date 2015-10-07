/**
 * @module sorting
 */
var SortColumn, SortDirection;

SortColumn = {
  Title: 'title',
  Year: 'year',
  Adapter: 'adapterId',
  Authors: 'sortStringAuthors',
  Subjects: 'sortStringSubjects'
};

SortDirection = {
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

module.exports = {
  SortColumn: SortColumn,
  SortDirection: SortDirection
};