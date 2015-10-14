'use strict';
import React from 'react';
import HTable from './h-table.jsx';
import HPager from './h-pager.jsx';
import autobind from 'autobind-decorator';
import * as Net from './../util/net.js';
import * as Sorting from './../../../app/sorting.js';
import _ from 'lodash';

var SortDirection = Sorting.SortDirection;

class BookList extends React.Component {
  constructor(props) {
    super(props);
    window._BookList = this;
    this.columnMetadata = [
      {
        columnName   : 'adapterId',
        cssClassName : 'h-adapterId',
        displayName  : 'Adapter',
        isSortable   : true
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
        sortColumnName : 'sortStringAuthors'
      }, {
        columnName     : 'subjects',
        cssClassName   : 'h-subjects',
        displayName    : 'Subjects',
        isSortable     : true,
        sortColumnName : 'sortStringSubjects'
      }, {
        columnName     : 'displayYear',
        cssClassName   : 'h-year',
        displayName    : 'Year',
        isSortable     : true,
        sortColumnName : 'year'
      }
    ];

    this.state = {
      isPerformingBlockingAction: false,
      books: [],
      currentPage: 0,
      maxPages: 0,
      pageSize: 25,
      sortColumn: 'title',
      sortAscending: true,
      displayColumns: ['adapterId', 'title', 'authors', 'subjects', 'displayYear']
    };
  }//constructor


  getBooksQuery(opts) {
    let state = _.assign(this.state, opts);
    return {
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      sortColumn: state.sortColumn,
      sortAscending: state.sortAscending
    };
  }


  @autobind
  handleBooksResponse(res) {
    this.setState({
      isPerformingBlockingAction: false,
      books: res.books,
      currentPage: parseInt(res.currentPage),
      maxPages: parseInt(res.maxPages),
      pageSize: parseInt(res.pageSize),
      sortColumn: res.sortColumn,
      sortAscending: res.sortAscending
    });
  }


  handleError(err) {
    this.setState({isPerformingBlockingAction: false});
    console.error(err);
    alert(`Error ${err.message}`);
  }//handleError


  fetchBooks(opts) {
    this.setState({isPerformingBlockingAction: true})
    let query = this.getBooksQuery(opts);
    Net.getBooks(query)
      .then(this.handleBooksResponse)
      .catch(this.handleError);
  }


  @autobind
  setPage(index) {
    if(this.state.isPerformingBlockingAction)
      return;

    if(typeof index === 'string'){
      index = Number(index);
    }
    this.fetchBooks({currentPage: index});
  }//setPage


  @autobind
  sortData(sort, sortAscending, data) {
    if(this.state.isPerformingBlockingAction)
      return;

    this.fetchBooks({
      sortColumn: sort,
      sortAscending: sortAscending
    });
  }//sortData


  @autobind
  changeSort(sort, sortAscending){
    this.sortData(sort, sortAscending);
  }//changeSort


  @autobind
  setFilter(filter) {
    console.warn('IMPLEMENT ME');
  }//setFilter


  @autobind
  setPageSize(size) {
    if(this.state.isPerformingBlockingAction)
      return;

    this.fetchBooks({pageSize: size});
  }//setPageSize


  @autobind
  componentDidMount() {
    this.fetchBooks();
  }//componentDidMount


  @autobind
  getCustomTitleRowComponent(book) {
    var downloadBook = function() {
      console.debug('download book');
      Net.requestDownload(book);
    }.bind(this);

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
    var className = `h-blocking-ui-wait ${this.state.isPerformingBlockingAction ? 'visible' : ''}`;
    return (
      <div className={className}>
        <span className='fa fa-refresh fa-spin'/>
        <span className='label'>Updating&hellip;</span>
      </div>
    );
  }


  render() {
    let styles = this.state.styles;
    return (
      <div className='h-book-list'>
        <HPager
          setPage={this.setPage}
          currentPage={this.state.currentPage}
          maxPages={this.state.maxPages}
        />
        <div className='h-table-wrapper'>
          <HTable
            rows           = {this.state.books}
            changeSort     = {this.changeSort}
            setFilter      = {this.setFilter}
            sortColumnName = {this.state.sortColumn}
            sortAscending  = {this.state.sortAscending}
            columns        = {this.state.displayColumns}
            columnMetadata = {this.columnMetadata}
          />
        </div>
        {this.getBlockingWaitComponent()}
      </div>
    );
  }
}

export default BookList;
