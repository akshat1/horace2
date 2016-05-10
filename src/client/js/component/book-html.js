'use strict';

const BookHTML = {
  getSelectionControl: function(book, isChecked) {
    return `
      <div class='h-book-list-selection-cell h-book-list-cell'>
        <input type='checkbox' ${isChecked ? 'selected' : ''} click-marker='select'/>
      </div>
    `;
  },


  getSelectAllColumnHeader: function(isChecked) {
    return `
      <div class='h-book-list-selection-cell h-book-list-cell'>
        <input type='checkbox' ${isChecked ? 'selected' : ''} click-marker='select-all'/>
      </div>
    `;
  },


  getTitle: function(title, isHeader) {
    let marker = isHeader ? 'title-header' : 'title';
    return `
      <div class='h-book-list-title-cell h-book-list-cell' title='${title}' click-marker='${marker}'>
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
      tooltip = `${firstItem} and ${items.length - 1} more.`
    }


    return {
      tooltip: tooltip,
      markup: `
        ${badge}
        ${firstItem}
      `
    };
  },


  getAuthors: function(authors) {
    let {markup, tooltip} = BookHTML.getArray(authors);
    return `
      <div class='h-book-authors-cell h-book-list-cell' title='${tooltip}' click-marker='authors'>
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


  getSubjects: function(subjects) {
    let {markup, tooltip} = BookHTML.getArray(subjects);
    return `
      <div class='h-book-subjects-cell h-book-list-cell' title='${tooltip}' click-marker='subjects'>
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


  getYear: function(year, isHeader) {
    let marker = isHeader ? 'year-header' : 'year';
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
    return {
      __html: `
          ${BookHTML.getSelectionControl(isSelected)}
          ${BookHTML.getTitle(book.title)}
          ${BookHTML.getAuthors(book.authors)}
          ${BookHTML.getYear(book.year)}
          ${BookHTML.getSubjects(book.subjects)}
        `
    };
  },


  getMemoCacheKey: function(book) {
    return book.id;
  }
}

BookHTML.getRowMarkup = _.memoize(BookHTML.getRowMarkupInner, BookHTML.getMemoCacheKey);
BookHTML.HeaderRowDefinition = {
    __html: `
        ${BookHTML.getSelectAllColumnHeader()}
        ${BookHTML.getTitleColumnHeader()}
        ${BookHTML.getAuthorsColumnHeader()}
        ${BookHTML.getYearColumnHeader()}
        ${BookHTML.getSubjectsColumnHeader()}
      `
  };


module.exports = BookHTML;
