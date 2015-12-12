'use strict';
import React from 'react';
import HTable from './h-table.jsx';
import HPager from './h-pager.jsx';
import autobind from 'autobind-decorator';
import PubSub from './../util/pubsub.js';
import {Client as ClientEvents} from './../../../app/events.js';


class BookList extends React.Component {
  constructor(props) {
    super(props);
    window._BookList = this;
    this.columnMetadata = [
      {
        columnName     : 'adapterId',
        cssClassName   : 'h-adapterId',
        displayName    : 'Adapter',
        isSortable     : true,
        isFiltered     : true
      }, {
        columnName   : 'title',
        cssClassName : 'h-title',
        displayName  : 'Title',
        isSortable   : true,
        rowComponent : this.renderCustomTitleRowComponent
        //isFiltered   : true
      }, {
        columnName     : 'authors',
        cssClassName   : 'h-authors',
        displayName    : 'Author',
        isSortable     : true,
        sortColumnName : 'sortStringAuthors',
        isFiltered     : true
      }, {
        columnName     : 'subjects',
        cssClassName   : 'h-subjects',
        displayName    : 'Subjects',
        isSortable     : true,
        sortColumnName : 'sortStringSubjects',
        isFiltered     : true
      }, {
        columnName     : 'displayYear',
        cssClassName   : 'h-year',
        displayName    : 'Year',
        isSortable     : true,
        sortColumnName : 'year',
        isFiltered     : true
      }
    ];
  }//constructor


  @autobind
  renderCustomTitleRowComponent(book) {
    var downloadBook = function() {
      PubSub.broadcast(ClientEvents.DOWNLOAD_BOOK, book);
    };

    return (
      <span className='h-book-title'>
        {book.title}
        <span className='h-book-actions'>
          <span className='fa fa-cloud-download' onClick={downloadBook}/>
        </span>
      </span>
    );
  }


  renderPager() {
    return (
      <HPager
        pubSubKey   = 'bookPager'
        currentPage = {this.props.currentPage}
        maxPages    = {this.props.maxPages}
      />
    );
  }


  renderBooks() {
    let props = this.props;
    return (
      <div className='h-table-wrapper'>
        <HTable
          pubSubKey      = 'bookTable'
          rows           = {props.books}
          sortColumnName = {props.sortColumn}
          sortAscending  = {props.sortAscending}
          columns        = {props.displayColumns}
          columnMetadata = {this.columnMetadata}
          selectedDistinctValues = {props.filter}
        />
      </div>
    );
  }


  renderBlockingWaitComponent() {
    var className = `h-blocking-ui-wait ${this.props.isPerformingBlockingAction ? 'visible' : ''}`;
    return (
      <div className={className}>
        <span className='fa fa-refresh fa-spin'/>
        <span className='label'>Updating&hellip;</span>
      </div>
    );
  }


  render() {
    let props = this.props;
    return (
      <div className='h-book-list'>
        {this.renderPager()}
        {this.renderBooks()}
        {this.renderBlockingWaitComponent()}
      </div>
    );
  }
}

export default BookList;
