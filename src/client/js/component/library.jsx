'use strict';

/*
TODO: Make server getBooks accept pager, sort and model as individual items
TODO: Make server getBooks return these properties in response
*/

import React from 'react';
import Path from 'path';
import autobind from 'autobind-decorator';
import _ from 'lodash';

import PubSub from './../util/pubsub.js';
import BookList from './book-list.jsx';
import MenuRenderer from './menu-renderer.jsx';
import ColumnFilter from './column-filter.jsx';
import ScanningStatus from './scanning-status.jsx';
import NotificationList from './notification-list.jsx';
import {Client as ClientEvents, Server as ServerEvents} from './../../../app/events.js';
import * as Net from './../util/net.js';
import { PagerModel, SortModel, DEFAULT_PAGER_PAGE_SIZE } from './../../../app/model/library-model.js';


window.Net = Net;


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
      displayColumns             : ['adapterId', 'title', 'authors', 'subjects', 'displayYear'],
      adapterFilterPopupVisible     : false,
      titleFilterPopupVisible       : false,
      authorsFilterPopupVisible     : false,
      subjectsFilterPopupVisible    : false,
      displayYearFilterPopupVisible : false
    };

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
    PubSub.subscribe(ClientEvents.LOAD_MORE_BOOKS, this.loadMoreBooks);
    PubSub.subscribe(ClientEvents.TABLE_SET_SORT, this.handleSortEvent);
    PubSub.subscribe(ClientEvents.BOOKS_SET_FILTER, this.handleFilterChange);
    PubSub.subscribe(ClientEvents.BOOKS_SHOW_FILTER, this.showFilterPopup);
    PubSub.subscribe(ClientEvents.DOWNLOAD_BOOK, this.handleBookDownloadRequested);
  }


  @autobind
  handleSortEvent(payload) {
    if (payload.key === 'bookTable')
      this.sortData(payload.sortModel);
  }


  isBooksFlushRequired(oldState, newState) {
    return !(_.isEqual(oldState.filter, newState.filter) && _.isEqual(oldState.bookSort, newState.bookSort));
  }


  @autobind
  handleBooksResponse(res) {
    let newState = res;
    if (!this.isBooksFlushRequired(this.state, newState)) {
      var books = this.state.books.concat(newState.books);
      newState.books = books;
    }
    newState.isPerformingBlockingAction = false;
    this.setState(newState);
  }


  @autobind
  handleError(err) {
    this.setState({isPerformingBlockingAction: false});
    console.error(err);
    alert(`Error ${err.message}`);
  }//handleError


  @autobind
  showFilterPopup(columnName) {
    //TODO: Maybe some sort of map?
    switch(columnName) {
      case 'adapterId': {
        this.setState({
          adapterFilterPopupVisible: true
        });
      } break;
      case 'title': {
        this.setState({
          titleFilterPopupVisible: true
        });
      } break;
      case 'authors': {
        this.setState({
          authorsFilterPopupVisible: true
        });
      } break;
      case 'subjects': {
        this.setState({
          subjectsFilterPopupVisible: true
        });
      } break;
      case 'displayYear': {
        this.setState({
          displayYearFilterPopupVisible: true
        });
      } break;
    }
  }


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


  /*
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
  */
  @autobind
  loadMoreBooks() {
    if(this.state.isPerformingBlockingAction)
      return;

    this.fetchBooks({
      bookPager: new PagerModel(this.state.books.length, this.state.books.length + (DEFAULT_PAGER_PAGE_SIZE / 3))
    });
  }


  @autobind
  sortData(sortModel) {
    if(this.state.isPerformingBlockingAction)
      return;

    this.fetchBooks({
      bookPager: new PagerModel(0, DEFAULT_PAGER_PAGE_SIZE),
      bookSort: sortModel
    });
  }//sortData


  @autobind
  handleFilterChange(filter) {
    var newFilter = _.extend(_.clone(this.state.filter), filter);
    this.fetchBooks({
      bookPager: new PagerModel(0, DEFAULT_PAGER_PAGE_SIZE),
      filter: newFilter
    });
  }


  handleBookDownloadRequested(book) {
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
        console.error('Error finding out if server is currently scanning', err);
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


  @autobind
  dismissPopup(flagName) {
    var args = {};
    args[flagName] = false;
    this.setState(args);
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
        pager                      = {bookPager}
        books                      = {state.books}
        sortColumn                 = {bookSort.columnName}
        sortAscending              = {bookSort.isAscending}
        displayColumns             = {state.displayColumns}
      />
    );
  }


  renderMenuRenderer() {
    return <MenuRenderer/>;
  }


  renderFilterPopups() {
    var _self = this;
    var popups = [];
    var getDismissFunction = function(flagName) {
      return function() {
        _self.dismissPopup(flagName);
      };
    };
    if (this.state.adapterFilterPopupVisible)
      popups.push(<ColumnFilter key='cfAdapterId' columnName='adapterId' className='h-column-filter h-column-filter-adapters' dismiss={getDismissFunction('adapterFilterPopupVisible')}/>);
    if (this.state.titleFilterPopupVisible)
      popups.push(<ColumnFilter key='cfTitle' columnName='title' className='h-column-filter h-column-filter-title' dismiss={getDismissFunction('titleFilterPopupVisible')}/>);
    if (this.state.authorsFilterPopupVisible)
      popups.push(<ColumnFilter key='cfAuthors' columnName='authors' className='h-column-filter h-column-filter-authors' dismiss={getDismissFunction('authorsFilterPopupVisible')}/>);
    if (this.state.subjectsFilterPopupVisible)
      popups.push(<ColumnFilter key='cfSubjects' columnName='subjects' className='h-column-filter h-column-filter-subjects' dismiss={getDismissFunction('subjectsFilterPopupVisible')}/>);
    if (this.state.displayYearFilterPopupVisible)
      popups.push(<ColumnFilter columnName='displayYear' className='h-column-filter h-column-filter-year' dismiss={getDismissFunction('displayYearFilterPopupVisible')}/>);
    return popups;
  }


  render() {
    return (
      <div className='h-library'>
        {this.renderToolbar()}
        {this.renderBookList()}
        {this.renderMenuRenderer()}
        {this.renderFilterPopups()}
      </div>
    );
  }//render
}//Library

export default Library;