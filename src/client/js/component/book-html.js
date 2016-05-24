'use strict';

const _ = require('lodash');

const ColumnName = {
  Title: 'title'
};


function getSortIndicatorMarkup (sortColumnName, isAscending, targetColumnName, clickMarker) {
  if (sortColumnName === targetColumnName) {
    let styleClass = isAscending ? 'fa-sort-asc' : 'fa-sort-desc';
    return `
      <div class = 'h-sort fa ${styleClass}' click-marker = '${clickMarker}'></div>
    `
  }
  else
    return '';
}


const BookHTML = {
  getSelectionControl: function(isChecked, bookId) {
    return `
      <div class='h-book-list-selection-cell h-book-list-cell'>
        <input type='checkbox' ${isChecked ? 'checked' : ''} click-marker='select' book-id='${bookId}'/>
      </div>
    `;
  },


  getSelectAllColumnHeader: function(isChecked) {
    //We don't want a select-all yet.
    //<input type='checkbox' ${isChecked ? 'selected' : ''} click-marker='select-all'/>
    return `
      <div class='h-book-list-selection-cell h-book-list-cell'>
      </div>
    `;
  },


  getTitle: function(title, bookId) {
    return `
      <div class='h-book-list-title-cell h-book-list-cell'>
        <a href='#' click-marker='title' book-id='${bookId}' title='${title}'>
          ${title}
        </a>
      </div>
    `;
  },


  getTitleColumnHeader: function(sortColumnName, isAscending) {
    return `
      <div class='h-book-list-title-cell h-book-list-cell' title='Title' click-marker='title-header'>
        ${getSortIndicatorMarkup(sortColumnName, isAscending, 'title', 'title-header')}
        Title
      </div>
    `;
  },


  getArray: function(items) {
    let firstItem = items[0] || '';
    let badge = '';
    let tooltip = firstItem;
    if (items.length > 1) {
      badge = `<span class='h-book-list-more-badge'>+${items.length - 1}</span>`;
      tooltip = `${firstItem} and ${items.length - 1} more.`;
    }


    return {
      tooltip: tooltip,
      markup: `
        ${badge}
        ${firstItem}
      `
    };
  },


  getAuthors: function(authors, bookId) {
    let {markup, tooltip} = BookHTML.getArray(authors);
    return `
      <div class='h-book-list-authors-cell h-book-list-cell' title='${tooltip}' click-marker='authors' book-id='${bookId}'>
        ${markup}
      </div>
    `;
  },


  getAuthorsColumnHeader: function(sortColumnName, isAscending) {
    return `
      <div class='h-book-list-authors-cell h-book-list-cell' click-marker='authors-header'>
        ${getSortIndicatorMarkup(sortColumnName, isAscending, 'authors', 'authors-header')}
        Author
      </div>
    `;
  },


  getSubjects: function(subjects, bookId) {
    let {markup, tooltip} = BookHTML.getArray(subjects);
    return `
      <div class='h-book-list-subjects-cell h-book-list-cell' title='${tooltip}' click-marker='subjects' book-id='${bookId}'>
        ${markup}
      </div>
    `;
  },


  getSubjectsColumnHeader: function(sortColumnName, isAscending) {
    return `
      <div class='h-book-list-subjects-cell h-book-list-cell' title='Subjects' click-marker='subjects-header'>
        ${getSortIndicatorMarkup(sortColumnName, isAscending, 'subjects', 'subjects-header')}
        Subjects
      </div>
    `;
  },


  getYear: function(year, bookId) {
    return `
      <div class='h-book-list-year-cell h-book-list-cell' click-marker='year' book-id='${bookId}'>
        ${year}
      </div>
    `;
  },


  getYearColumnHeader: function(sortColumnName, isAscending) {
    return `
      <div class='h-book-list-year-cell h-book-list-cell' click-marker='year-header'>
        ${getSortIndicatorMarkup(sortColumnName, isAscending, 'year', 'year-header')}
        Year
      </div>
    `;
  },


  getRowMarkupInner: function(book, isSelected) {
    let bookId = book.id;
    return {
      __html: `
          ${BookHTML.getSelectionControl(isSelected, bookId)}
          ${BookHTML.getTitle(book.title, bookId)}
          ${BookHTML.getAuthors(book.authors, bookId)}
          ${BookHTML.getYear(book.displayYear, bookId)}
          ${BookHTML.getSubjects(book.subjects, bookId)}
        `
    };
  },


  getMemoCacheKey: function(book, isSelected) {
    return `${book.id}-${isSelected}`;
  }
}

// We would want to keep an eye on memory usage by this guy.
BookHTML.getRowMarkup = _.memoize(BookHTML.getRowMarkupInner, BookHTML.getMemoCacheKey);
BookHTML.getHeaderRowMarkup = function(sortColumnName, isAscending) {
  return {
    __html: `
        ${BookHTML.getSelectAllColumnHeader()}
        ${BookHTML.getTitleColumnHeader(sortColumnName, isAscending)}
        ${BookHTML.getAuthorsColumnHeader(sortColumnName, isAscending)}
        ${BookHTML.getYearColumnHeader(sortColumnName, isAscending)}
        ${BookHTML.getSubjectsColumnHeader(sortColumnName, isAscending)}
      `
  };
}



module.exports = BookHTML;
