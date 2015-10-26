'use strict'

const DEFAULT_PAGER_PAGE_SIZE = 25;

export class PagerModel {
  constructor(currentPage, pageSize, maxPages) {
    this.currentPage = currentPage || 0;
    this.pageSize    = pageSize || DEFAULT_PAGER_PAGE_SIZE;
    this.maxPages    = maxPages || 0;
  }
}


export class SortModel {
  constructor(columnName, isAscending) {
    this.columnName = columnName;
    this.isAscending = isAscending;
  }
}
