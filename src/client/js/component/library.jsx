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

import PubSub from './../util/pubsub.js'
import BookList from './book-list.jsx';
import MenuRenderer from './menu-renderer.jsx';
import ScanningStatus from './scanning-status.jsx';
import NotificationList from './notification-list.jsx';
import HoraceEvents from './../../../app/events.js';
import * as Net from './../util/net.js';
import { PagerModel, SortModel } from './../../../app/model/library-model.js';


window.Net = Net;

const ServerEvents = HoraceEvents.Server;
const ClientEvents = HoraceEvents.Client;

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

    this.wireWebSockets();
    this.wirePubSub();
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


  @autobind
  wirePubSub() {
    PubSub.subscribe(ClientEvents.PAGER_SET_PAGE, this.handlePageSetEvent);
    PubSub.subscribe(ClientEvents.TABLE_SET_SORT, this.handleSortEvent);
    PubSub.subscribe(ClientEvents.BOOKS_SET_FILTER, this.handleFilterChange)
    PubSub.subscribe(ClientEvents.DOWNLOAD_BOOK, this.handleBookDownloadRequested);
  }


  @autobind
  handlePageSetEvent(payload) {
    if (payload.key === 'bookPager')
      this.setPage(payload.pageNumber);
  }

  @autobind
  handleSortEvent(payload) {
    if (payload.key === 'bookTable')
      this.sortData(payload.sortModel);
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
  sortData(sortModel) {
    if(this.state.isPerformingBlockingAction)
      return;

    this.fetchBooks({
      bookSort: sortModel
    });
  }//sortData


  @autobind
  handleFilterChange(filter) {
    var newFilter = _.extend(this.state.filter, filter);
    this.fetchBooks({
      filter: newFilter
    });
  }


  handleBookDownloadRequested(book) {
    console.debug('handleBookDownloadRequested(%O)', book);
    Net.requestDownload(book);
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
        filter                     = {state.filter}
        isPerformingBlockingAction = {state.isPerformingBlockingAction}
        selectedValues             = {this.props.filter}
        currentPage                = {bookPager.currentPage}
        maxPages                   = {bookPager.maxPages}
        books                      = {state.books}
        sortColumn                 = {bookSort.columnName}
        sortAscending              = {bookSort.isAscending}
        displayColumns             = {state.displayColumns}
        getDistinct                = {this.getDistinct}
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