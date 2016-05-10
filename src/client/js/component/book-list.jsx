'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const ClientEvents = require('./../../../app/events.js').Client;
const _ = require('lodash');
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
  }


  askForMoreBooks(from, numItems) {
    PubSub.broadcast(ClientEvents.LOAD_MORE_BOOKS, {
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
      case 'title-header'    : return this.handleTitleHeaderClick(evt);
      case 'authors'         : return this.handleAuthorsClick(evt);
      case 'authors-header'  : return this.handleAuthorsHeaderClick(evt);
      case 'subjects'        : return this.handleSubjectsClick(evt);
      case 'subjects-header' : return this.handleSubjectsHeaderClick(evt);
      case 'year'            : return this.handleYearClick(evt);
      case 'year-header'     : return this.handleYearHeaderClick(evt);
    }
    console.warn('Could not identify what was clicked');
  }


  handleCheckboxClick(evt) {
    console.log(0);
  }


  handleSelectAllClick(evt) {
    console.log(1);
  }


  handleTitleClick(evt) {
    console.log(2);
  }


  handleTitleHeaderClick(evt) {
    console.log(3);
  }


  handleAuthorsClick(evt) {
    console.log(4);
  }


  handleAuthorsHeaderClick(evt) {
    console.log(5);
  }


  handleSubjectsClick(evt) {
    console.log(6);
  }


  handleSubjectsHeaderClick(evt) {
    console.log(7);
  }


  handleYearClick(evt) {
    console.log(8);
  }


  handleYearHeaderClick(evt) {
    console.log(9);
  }


  @autobind
  render() {
    let props = this.props;
    let rows  = props.books.map(BookHTML.getRowMarkup);
    let eventsMap = {
      click: this.handleGridClick
    };
    return (
      <div className = {StyleClass.ROOT}>
        <div className = {StyleClass.INNERWRAPPER}>
          <SimianGrid
            events           = {eventsMap}
            ref              = 'SIMIAN_GRID'
            headerRow        = {HeaderRowDefinition}
            rows             = {rows}
            onMoreRowsNeeded = {this.askForMoreBooks}
            numTotalRows     = {7190}
            columnDefinition = {ColumnDefinition}
            rowHeight        = {40}
            pageSize         = {200}
            numBufferRows    = {20}
            noTable          = {true}
          />
        </div>
      </div>
    );
  }
}


module.exports = BookList;
