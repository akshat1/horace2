'use strict';
import React from 'react';
import Griddle from 'griddle-react';
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
      pageSize: 15,
      sortColumn: 'title',
      sortAscending: true,
      displayColumns: ['adapterId', 'title', 'authors', 'subjects', 'displayYear'],
      columnMetadata: [
        {
          columnName: 'adapterId',
          order: 0,
          cssClassName: 'h-adapterId',
          displayName: 'Adapter'
        },{
          columnName: 'title',
          order: 1,
          cssClassName: 'h-title',
          displayName: 'Title'
        },{
          columnName: 'authors',
          order: 2,
          cssClassName: 'h-authors',
          displayName: 'Author'
        },{
          columnName: 'subjects',
          order: 3,
          cssClassName: 'h-subjects',
          displayName: 'Subjects'
        },{
          columnName: 'displayYear',
          order: 4,
          cssClassName: 'h-year',
          displayName: 'Year'
        }
      ],
      styles: {
        table: 'u-full-width h-list-table'
      }
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
    console.debug('handleBooksResponse(%O)', res);
    this.setState({
      books: res.books,
      currentPage: parseInt(res.currentPage),
      maxPages: parseInt(res.maxPages),
      pageSize: parseInt(res.pageSize),
      sortColumn: res.sortColumn,
      sortAscending: res.sortAscending.toLowerCase() === 'true' ? true : false
    });
  }


  handleError(err) {
    console.error(err);
    alert(`Error ${err.message}`);
  }//handleError


  fetchBooks(opts) {
    console.debug('getBooks');
    let query = this.getBooksQuery(opts);
    console.debug('query is %O', query);
    Net.getBooks(query)
      .then(this.handleBooksResponse)
      .catch(this.handleError);
  }


  @autobind
  setPage(index) {
    if(typeof index === 'string'){
      debugger;
    }
    console.debug(`setPage(${index})`);
    this.fetchBooks({currentPage: index});
  }//setPage


  @autobind
  sortData(sort, sortAscending, data) {
    console.debug(`sortData(${sort}, ${sortAscending}, ${data})`);
    this.fetchBooks({
      sortColumn: sort,
      sortAscending: sortAscending
    });
  }//sortData


  @autobind
  changeSort(sort, sortAscending){
    console.debug(`changeSort(${sort}, ${sortAscending})`);
    this.sortData(sort, sortAscending);
  }//changeSort


  @autobind
  setFilter(filter) {
    console.debug(`setFilter(${filter})`);
    console.warn('IMPLEMENT ME');
  }//setFilter


  @autobind
  setPageSize(size) {
    console.debug(`setPageSize(${size})`);
    this.fetchBooks({pageSize: size});
  }//setPageSize


  @autobind
  componentDidMount() {
    console.debug('componentDidMount');
    this.fetchBooks();
  }//componentDidMount


  render() {
    console.debug('columns: ', this.state.displayColumns);
    //<Griddle results={this.props.data} columns={['title', 'year']} />
    let styles = this.state.styles;
    return (
      <Griddle 
        useExternal           = {true}
        results               = {this.state.books}
        externalSetPage       = {this.setPage}
        externalChangeSort    = {this.changeSort}
        externalSetFilter     = {this.setFilter}
        externalSetPageSize   = {this.setPageSize}
        externalMaxPage       = {this.state.maxPages}
        externalCurrentPage   = {this.state.currentPage}
        resultsPerPage        = {this.state.pageSize}
        externalSortColumn    = {this.state.sortColumn}
        externalSortAscending = {this.state.sortAscending}
        showFilter            = {false}
        showSettings          = {false}
        
        useGriddleStyles      = {false}
        columns               = {this.state.displayColumns}
        columnMetadata        = {this.state.columnMetadata}
        tableClassName        = {styles.table}
      />
    );
  }
}

export default BookList;
