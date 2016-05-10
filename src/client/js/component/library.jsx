'use strict';

/*
TODO: Make server getBooks accept pager, sort and model as individual items
TODO: Make server getBooks return these properties in response
*/

var React = require('react');
var Path = require('path');
var autobind = require('autobind-decorator');
var _ = require('lodash');

var PubSub = require('./../util/pubsub.js');
var BookList = require('./book-list.jsx')
var MenuRenderer = require('./menu-renderer.jsx')
var ColumnFilter = require('./column-filter.jsx')
var ScanningStatus = require('./scanning-status.jsx')
var Toolbar = require('./tool-bar.jsx')
var BookListActionBar = require('./book-list-action-bar.jsx')
var HEvents = require('./../../../app/events.js');
var ClientEvents = HEvents.Client;
var ServerEvents = HEvents.Server;
var Net = require('./../util/net.js');
var HModel = require('./../../../app/model/library-model.js');
var PagerModel = HModel.PagerModel;
var SortModel = HModel.SortModel;
var DEFAULT_PAGER_PAGE_SIZE = HModel.DEFAULT_PAGER_PAGE_SIZE;

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
      selectedBooks              : [],
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
    PubSub.subscribe(ClientEvents.NOTIFICATION_DISMISS, this.dismissNotification);
    PubSub.subscribe(ClientEvents.LOAD_MORE_BOOKS, this.loadMoreBooks);
    PubSub.subscribe(ClientEvents.TABLE_SET_SORT, this.handleSortEvent);
    PubSub.subscribe(ClientEvents.BOOKS_SET_FILTER, this.handleFilterChange);
    PubSub.subscribe(ClientEvents.SELECTION_CLEAR, this.clearCurrentSelection);
    PubSub.subscribe(ClientEvents.BOOKS_SHOW_FILTER, this.showFilterPopup);
    PubSub.subscribe(ClientEvents.BOOK_DOWNLOAD, this.handleBookDownloadRequested);
    PubSub.subscribe(ClientEvents.BOOK_SELECTION_CHANGED, this.handleBookSelectionChange);
    PubSub.subscribe(ClientEvents.BOOK_EDIT, this.handleBookEdit);
    PubSub.subscribe(ClientEvents.BOOK_HIDE, this.handleBookHide);
  }


  @autobind
  handleBookEdit() {
    alert('Edit all these books');
  }


  @autobind
  handleBookHide() {
    // TODO: Batch this?
    //this.state.selectedBooks.forEach(Net.hideBook);
    Net.hideBooks(this.state.selectedBooks).then(function() {
      this.loadMoreBooks({
        isReload: true
      });
    }.bind(this));
  }


  @autobind
  clearCurrentSelection() {
    console.debug('library:clearCurrentSelection');
    this.setState({
      selectedBooks: []
    });
    console.log('Done');
  }


  @autobind
  handleBookSelectionChange(payload) {
    if (payload.isSelected) {
      this.setState({
        selectedBooks: this.state.selectedBooks.concat([payload.book])
      });
    } else {
      this.setState({
        selectedBooks: this.state.selectedBooks.filter(function(b) {
          return b !== payload.book;
        })
      });
    }
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
    res.books = this.state.books.concat(res.books);
    res.isPerformingBlockingAction = false;
    /*
    if (!this.isBooksFlushRequired(this.state, newState)) {
      let books;
      books = this.state.books.concat(newState.books);
      newState.books = books;
    }
    newState.isPerformingBlockingAction = false;
    newState.selectedBooks = [];
    */
    this.setState(res);
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
  loadMoreBooks({isReload, from, numItems} = opts) {
    if(this.state.isPerformingBlockingAction)
      return;

    //let from = isReload ? (this.lastLoadedFrom || 0) : this.state.books.length;
    let numMoreBooks = isReload ? 0 : (numItems || DEFAULT_PAGER_PAGE_SIZE / 3);
    this.lastLoadedFrom = from;

    this.fetchBooks({
      bookPager: new PagerModel(from, from + numMoreBooks)
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


  @autobind
  handleBookDownloadRequested() {
    this.state.selectedBooks.forEach(Net.requestDownload);
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
    return (<Toolbar
      notifications={state.notifications}
      serverStatusIndicators={this.getServerStatusIndicators()}
    />);
  }


  renderSelectionSummary() {
    return (<BookListActionBar selectedBooks={this.state.selectedBooks}/>);
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
        selectedBooks              = {state.selectedBooks}
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
        {this.renderSelectionSummary()}
        {this.renderBookList()}
        {this.renderMenuRenderer()}
        {this.renderFilterPopups()}
      </div>
    );
  }//render
}//Library

module.exports = Library;