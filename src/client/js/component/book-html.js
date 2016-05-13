'use strict';

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


  getTitle: function(title, isHeader, bookId, sortClassName) {
    let marker;
    let bookIdAttr;
    if (isHeader) {
      marker = 'title-header';
      bookIdAttr = '';
    } else {
      marker = 'title';
      bookIdAttr = `book-id='${bookId}'`;
    }

    return `
      <div class='h-book-list-title-cell h-book-list-cell ${sortClassName}' title='${title}' click-marker='${marker}' ${bookIdAttr}>
        ${title}
      </div>
    `;
  },


  getTitleColumnHeader: function() {
    return BookHTML.getTitle('Title', true);
  },


  getArray: function(items) {
    let firstItem = items[0];
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
      <div class='h-book-authors-cell h-book-list-cell' title='${tooltip}' click-marker='authors' book-id='${bookId}'>
        ${markup}
      </div>
    `;
  },


  getAuthorsColumnHeader: function() {
    return `
      <div class='h-book-authors-cell h-book-list-cell' click-marker='authors-header'>
        Author
      </div>
    `;
  },


  getSubjects: function(subjects, bookId) {
    let {markup, tooltip} = BookHTML.getArray(subjects);
    return `
      <div class='h-book-subjects-cell h-book-list-cell' title='${tooltip}' click-marker='subjects' book-id='${bookId}'>
        ${markup}
      </div>
    `;
  },


  getSubjectsColumnHeader: function() {
    return `
      <div class='h-book-subjects-cell h-book-list-cell' title='Subjects' click-marker='subjects-header'>
        Subjects
      </div>
    `;
  },


  getYear: function(year, isHeader, bookId) {
    let marker, bookIdAttr;
    if (isHeader) {
      marker = 'year-header';
      bookIdAttr = '';
    } else {
      marker = 'year';
      bookIdAttr = `book-id='${bookId}'`;
    };

    return `
      <div class='h-book-list-year-cell h-book-list-cell' click-marker='${marker}'>
        ${year}
      </div>
    `;
  },


  getYearColumnHeader: function() {
    return BookHTML.getYear('Year', true);
  },


  getRowMarkupInner: function(book, isSelected) {
    let bookId = book.id;
    return {
      __html: `
          ${BookHTML.getSelectionControl(isSelected, bookId)}
          ${BookHTML.getTitle(book.title, false, bookId)}
          ${BookHTML.getAuthors(book.authors, bookId)}
          ${BookHTML.getYear(book.year, false, bookId)}
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
  let sortClassName = '';
  return {
    __html: `
        ${BookHTML.getSelectAllColumnHeader()}
        ${BookHTML.getTitleColumnHeader()}
        ${BookHTML.getAuthorsColumnHeader()}
        ${BookHTML.getYearColumnHeader()}
        ${BookHTML.getSubjectsColumnHeader()}
      `
  };
}



module.exports = BookHTML;
