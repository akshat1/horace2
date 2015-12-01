'use strict';

/* istanbul ignore next */
const DEFAULT_PAGER_PAGE_SIZE = 25;

/* istanbul ignore next Nothing significant to test */
class PagerModel {
  constructor(currentPage, pageSize, maxPages) {
    this.currentPage = currentPage || 0;
    this.pageSize    = pageSize || DEFAULT_PAGER_PAGE_SIZE;
    this.maxPages    = maxPages || 0;
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
  SortModel  : SortModel
};
