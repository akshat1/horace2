'use strict';

import EventEmitter from 'events';
import React from 'react';
import Path from 'path';
import autobind from 'autobind-decorator';

import BookList from './book-list.jsx';
import MenuRenderer from './menu-renderer.jsx';
import ScanningStatus from './scanning-status.jsx';
import NotificationList from './notification-list.jsx';
import HoraceEvents from './../../../app/events.js';
import * as Net from './../util/net.js';
import _ from 'lodash';

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
      currentPage                : 0,
      maxPages                   : 0,
      pageSize                   : 25,
      sortColumn                 : 'title',
      sortAscending              : true,
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
    return {
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      sortColumn: state.sortColumn,
      sortAscending: state.sortAscending,
      filter: state.filter
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
      sortAscending: res.sortAscending,
      filter: res.filter
    });
  }


  @autobind
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
  setPageSize(size) {
    if(this.state.isPerformingBlockingAction)
      return;

    this.fetchBooks({pageSize: size});
  }//setPageSize


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
    this.fetchBooks();
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


  render() {
    let state = this.state;
    return (
      <div className='h-library'>
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
        <BookList
          isPerformingBlockingAction = {state.isPerformingBlockingAction}
          setPage                    = {this.setPage}
          currentPage                = {state.currentPage}
          maxPages                   = {state.maxPages}
          books                      = {state.books}
          changeSort                 = {this.changeSort}
          setFilter                  = {this.setFilter}
          sortColumn                 = {state.sortColumn}
          sortAscending              = {state.sortAscending}
          displayColumns             = {state.displayColumns}
          getDistinct                = {this.getDistinct}
          onFilterChange             = {this.handleFilterChange}
        />
        <MenuRenderer/>
      </div>
    );
  }//render
}//Library

export default Library;