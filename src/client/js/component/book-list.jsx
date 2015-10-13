'use strict';
import React from 'react';
//import Griddle from 'griddle-react';
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
    this.state = {
      books: [],
      currentPage: 0,
      maxPages: 0,
      pageSize: 24,
      sortColumn: 'title',
      sortAscending: true,
      displayColumns: ['adapterId', 'title', 'authors', 'subjects', 'displayYear'],
      columnMetadata: [
        {
          columnName   : 'adapterId',
          cssClassName : 'h-adapterId',
          displayName  : 'Adapter',
          isSortable   : true
        }, {
          columnName   : 'title',
          cssClassName : 'h-title',
          displayName  : 'Title',
          isSortable   : true
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
      ]
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
      books: res.books,
      currentPage: parseInt(res.currentPage),
      maxPages: parseInt(res.maxPages),
      pageSize: parseInt(res.pageSize),
      sortColumn: res.sortColumn,
      sortAscending: res.sortAscending
    });
  }


  handleError(err) {
    console.error(err);
    alert(`Error ${err.message}`);
  }//handleError


  fetchBooks(opts) {
    let query = this.getBooksQuery(opts);
    Net.getBooks(query)
      .then(this.handleBooksResponse)
      .catch(this.handleError);
  }


  @autobind
  setPage(index) {
    if(typeof index === 'string'){
      index = Number(index);
    }
    this.fetchBooks({currentPage: index});
  }//setPage


  @autobind
  sortData(sort, sortAscending, data) {
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
    this.fetchBooks({pageSize: size});
  }//setPageSize


  @autobind
  componentDidMount() {
    this.fetchBooks();
  }//componentDidMount


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
            columnMetadata = {this.state.columnMetadata}
          />
        </div>
      </div>
    );
  }
}

export default BookList;
