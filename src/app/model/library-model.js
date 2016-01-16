'use strict';

/* istanbul ignore next */
const DEFAULT_PAGER_PAGE_SIZE = 21;

/* istanbul ignore next Nothing significant to test */
class PagerModel {
  constructor(from, to) {
    this.from = from = from || 0;
    this.to = to || (from + DEFAULT_PAGER_PAGE_SIZE);
  }
}


/* istanbul ignore next Nothing significant to test */
class SortModel {
  constructor(columnName, isAscending) {
    this.columnName = columnName;
    this.isAscending = isAscending;
  }
}

/* istanbul ignore next */
module.exports = {
  PagerModel : PagerModel,
  SortModel  : SortModel,
  DEFAULT_PAGER_PAGE_SIZE : DEFAULT_PAGER_PAGE_SIZE
};
