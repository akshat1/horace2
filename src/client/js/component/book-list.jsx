'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const Net = require('./../util/net.js');
const {
  Client: ClientEvents,
  Server: ServerEvents
} = require('./../../../app/events.js');
const BookHTML = require('./book-html.js');
const SimianGrid = require('simian-grid');


const StyleClass = {
  ROOT: 'h-book-list',
  INNERWRAPPER: 'h-book-list-inner-wrapper'
};

const ColumnDefinition = [];
const HeaderRowDefinition = BookHTML.HeaderRowDefinition;


class BookList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rows = [];
    this.eventsMap = {
      click: this.handleGridClick
    };
  }


  askForMoreBooks(from, numItems) {
    PubSub.broadcast(ClientEvents.REQUEST_BOOKS, {
      from: from,
      numItems: numItems
    });
  }


  @autobind
  handleGridClick(evt) {
    switch (evt.target.getAttribute('click-marker')) {
      case 'select'          : return this.handleCheckboxClick(evt);
      case 'select-all'      : return this.handleSelectAllClick(evt);
      case 'title'           : return this.handleTitleClick(evt);
      case 'subjects'        : return this.handleSubjectsClick(evt);
      case 'year'            : return this.handleYearClick(evt);
      case 'authors'         : return this.handleAuthorsClick(evt);
      case 'title-header'    : return this.handleHeaderClicked('title');
      case 'authors-header'  : return this.handleHeaderClicked('authors');
      case 'subjects-header' : return this.handleHeaderClicked('subjects');
      case 'year-header'     : return this.handleHeaderClicked('year');
    }
    console.warn('Could not identify what was clicked >', evt.target.getAttribute('click-marker'), '<');
  }


  handleCheckboxClick(evt) {
    let checkbox = evt.target;
    let bookId = checkbox.getAttribute('book-id');
    PubSub.broadcast(ClientEvents.BOOK_SELECTION_CHANGED, {
      id: bookId,
      isSelected: checkbox.checked
    });
  }


  handleSelectAllClick(evt) {
    console.log('Select All Books');
  }


  handleTitleClick(evt) {
    console.log('book clicked: ', evt.target.getAttribute('book-id'));
    Net.requestBookDownload(evt.target.getAttribute('book-id'));
  }


  handleAuthorsClick(evt) {
    console.log('authors clicked: ', evt.target.getAttribute('book-id'));
  }


  handleSubjectsClick(evt) {
    console.log('subjects clicked: ', evt.target.getAttribute('book-id'));
  }


  handleYearClick(evt) {
    console.log('year clicked: ', evt.target.getAttribute('book-id'));
  }


  handleHeaderClicked(columnName) {
    PubSub.broadcast(ClientEvents.SORT_CHANGED, {
      columnName: columnName
    })
  }


  @autobind
  render() {
    let props = this.props;
    let rows  = props.books.map((b) => BookHTML.getRowMarkup(b, b.isSelected) );
    let headerRowMarkup = BookHTML.getHeaderRowMarkup(props.sort.columnName, props.sort.isAscending);
    return (
      <div className = {StyleClass.ROOT}>
        <div className = {StyleClass.INNERWRAPPER}>
          <SimianGrid
            events           = {this.eventsMap}
            ref              = 'SIMIAN_GRID'
            headerRow        = {headerRowMarkup}
            rows             = {rows}
            onMoreRowsNeeded = {this.askForMoreBooks}
            numTotalRows     = {props.totalBooksInSystem}
            columnDefinition = {ColumnDefinition}
            rowHeight        = {40}
            pageSize         = {200}
            numBufferRows    = {20}
            noTable          = {true}
            rowNumber        = {props.bookListStartRowNumber}
          />
        </div>
      </div>
    );
  }
}


module.exports = BookList;
