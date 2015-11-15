'use strict';
import React from 'react';
import HTable from './h-table.jsx';
import HPager from './h-pager.jsx';
import autobind from 'autobind-decorator';
import PubSub from './../util/pubsub.js';
import * as Net from './../util/net.js';
import HoraceEvents from './../../../app/events.js';
const ClientEvents = HoraceEvents.Client;


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
        rowComponent : this.getCustomTitleRowComponent
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
  getCustomTitleRowComponent(book) {
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


  getBlockingWaitComponent() {
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
        <HPager
          pubSubKey   = 'bookPager'
          currentPage = {props.currentPage}
          maxPages    = {props.maxPages}
        />
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
        {this.getBlockingWaitComponent()}
      </div>
    );
  }
}

export default BookList;
