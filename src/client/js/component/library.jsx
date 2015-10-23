'use strict';

/*
TODO: Make server getBooks accept pager, sort and model as individual items
TODO: Make server getBooks return these properties in response
*/

import EventEmitter from 'events';
import React from 'react';
import Path from 'path';
import autobind from 'autobind-decorator';
import _ from 'lodash';

import BookList from './book-list.jsx';
import MenuRenderer from './menu-renderer.jsx';
import ScanningStatus from './scanning-status.jsx';
import NotificationList from './notification-list.jsx';
import HoraceEvents from './../../../app/events.js';
import * as Net from './../util/net.js';
import { PagerModel, SortModel } from './../model/library-model.js';


window.Net = Net;

const ServerEvents = HoraceEvents.Server;

class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;

    this.state = {
      isScanning: false,
      notifications: [],

      //booklist
      filter                     : {},
      isPerformingBlockingAction : false,
      books                      : [],
      bookPager                  : new PagerModel(),
      bookSort                   : new SortModel('title', true),
      displayColumns             : ['adapterId', 'title', 'authors', 'subjects', 'displayYear']
    }
  }//constructor


  @autobind
  setScanning(isScanning) {
    this.setState({isScanning: isScanning});
  }


  wireWebSockets() {
    Net.onWebSocket(ServerEvents.SCANNER_SCANSTARTED, function(){
      this.setState({isScanning: true});
    }.bind(this));

    Net.onWebSocket(ServerEvents.SCANNER_SCANSTOPPED, function(){
      this.setState({isScanning: false});
    }.bind(this));

    Net.onWebSocket(ServerEvents.BOOK_READY_FOR_DOWNLOAD, function(payload){
      this.generateFileDownloadNotification(payload.path);
    }.bind(this));
  }


  getBooksQuery(opts) {
    let state = _.assign(this.state, opts);
    let pager = state.bookPager;
    let sort  = state.bookSort;
    return {
      currentPage   : pager.currentPage,
      pageSize      : pager.pageSize,
      sortColumn    : sort.columnName,
      sortAscending : sort.isAscending,
      filter        : state.filter
    };
  }


  @autobind
  handleBooksResponse(res) {
    let newState = res;
    newState.isPerformingBlockingAction = false;
    this.setState(newState);
  }


  @autobind
  handleError(err) {
    this.setState({isPerformingBlockingAction: false});
    console.error(err);
    alert(`Error ${err.message}`);
  }//handleError


  fetchBooks(opts) {
    this.setState({isPerformingBlockingAction: true});
    let state  = this.state;
    let pager  = opts.bookPager || state.bookPager;
    let sort   = opts.bookSort  || state.bookSort;
    let filter = opts.filter    || state.filter;
    Net.getBooks(pager, sort, filter)
      .then(this.handleBooksResponse)
      .catch(this.handleError);
  }


  getDistinct(columnName) {
    return Net.getDistinctBookAttribute(columnName);
  }


  @autobind
  setPage(index) {
    if(this.state.isPerformingBlockingAction)
      return;

    if(typeof index === 'string'){
      index = Number(index);
    }

    let pager = this.state.bookPager;
    this.fetchBooks({
      bookPager: new PagerModel(index, pager.pageSize, pager.maxPages)
    });
  }//setPage


  @autobind
  sortData(sortColumn, isAscending) {
    if(this.state.isPerformingBlockingAction)
      return;

    this.fetchBooks({
      bookSort: new SortModel(sortColumn, isAscending)
    });
  }//sortData


  @autobind
  changeSort(sortColumn, isAscending){
    this.sortData(sortColumn, isAscending);
  }//changeSort


  @autobind
  handleFilterChange(filter) {
    this.fetchBooks({
      filter: filter
    });
  }


  @autobind
  generateFileDownloadNotification(filePath) {
    var fileName = Path.basename(filePath);
    var notifications = this.state.notifications;
    notifications.push (<div className='h-file-download'>
        Download Ready:&nbsp;
        <a href={filePath}>{fileName}</a>
      </div>);
    this.setState({notifications: notifications});
  }


  @autobind
  componentDidMount() {
    this.wireWebSockets();
    this.fetchBooks({});
    Net.isServerScanningForBooks()
      .then(this.setScanning)
      .catch(function(err){
        console.error('Error findind out if server is currently scanning');
      });
    setTimeout(this.generateNotification, 500);
  }


  @autobind
  startScanning() {
    if(!this.state.isScanning)
      Net.doStartScanning();
  }


  @autobind
  getServerStatusIndicators() {
    var components = [];
    components.push(<ScanningStatus key='server.status.scanning' isActive={this.state.isScanning} onClick={this.startScanning}/>);

    return (
      <div className='h-toolbar-item h-tool-bar-server-status-container'>
        {components}
      </div>
    );
  }


  @autobind
  dismissNotification(notification) {
    var notifications = this.state.notifications.filter(function(n) {
      return n!== notification;
    });
    this.setState({
      notifications: notifications
    });
  }


  renderToolbar() {
    let state = this.state;
    return (
      <div className='h-tool-bar'>
        <div className='h-toolbar-section-left'>
          <NotificationList notifications={state.notifications} dismiss={this.dismissNotification}/>
        </div>
        <div className='h-toolbar-section-center'/>
        <div className='h-toolbar-section-right'>
          {this.getServerStatusIndicators()}
          <div className='h-toolbar-item h-logo'>
            Horace
          </div>
        </div>
      </div>
    );
  }


  renderBookList() {
    let state     = this.state;
    let bookPager = state.bookPager;
    let bookSort  = state.bookSort;

    return (
      <BookList
        isPerformingBlockingAction = {state.isPerformingBlockingAction}
        setPage                    = {this.setPage}
        currentPage                = {bookPager.currentPage}
        maxPages                   = {bookPager.maxPages}
        books                      = {state.books}
        changeSort                 = {this.changeSort}
        setFilter                  = {this.setFilter}
        sortColumn                 = {bookSort.columnName}
        sortAscending              = {bookSort.isAscending}
        displayColumns             = {state.displayColumns}
        getDistinct                = {this.getDistinct}
        onFilterChange             = {this.handleFilterChange}
      />
    );
  }


  render() {
    return (
      <div className='h-library'>
        {this.renderToolbar()}
        {this.renderBookList()}
        <MenuRenderer/>
      </div>
    );
  }//render
}//Library

export default Library;