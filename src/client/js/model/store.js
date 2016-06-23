/*
  An alternative approach to flux/redux ideal of uni-directional data flow.
*/


const PubSub   = require('../util/pubsub.js');
const Net      = require('../util/net.js');
const autobind = require('autobind-decorator');
const {SortModel, PagerModel} = require('../../../app/model/library-model.js');
const {Client: ClientEvents, Server: ServerEvents} = require('../../../app/events.js');
const {applySequence} = require('./transforms.js');
const _ = require('lodash');


class Store {
  constructor() {
    window.store = this;
    this._listeners = [];
    this._state = this._getInitialState();
    this._wireWebSockets();
    this._wirePubSub();
  }


  static buildFullTextSearchFilter(searchString) {
    if (searchString && searchString.trim())
      return {
        '$text': {
          '$search': searchString
        }
      };

    else
      return null;
  }


  static getSearchStringFromFullTextSearchFilter(filter) {
    if (filter['$text'])
      return filter['$text']['$search'];
  }


  _setState(addendum) {
    this._state = applySequence(Object.assign(this._state, addendum));
    this._emitChange();
  }


  _getInitialState() {
    return {
      totalBooksInSystem     : 0,
      bookListStartRowNumber : 0,
      isScanning             : false,
      isEditingBooks         : false,
      isBusy                 : false,
      books                  : [],
      selectedBookIdMap      : {},
      selectedBooks          : [],
      booksReadyForDownload  : [],
      sortModel              : new SortModel('title', true),
      searchString           : ''
    };
  }


  _wireWebSockets() {
    Net.onWebSocket(ServerEvents.SCANNER_SCANSTARTED, this._handleScannerStarted);
    Net.onWebSocket(ServerEvents.SCANNER_SCANSTOPPED, this._handleScannerStopped);
    Net.onWebSocket(ServerEvents.BOOK_READY_FOR_DOWNLOAD, this._handleBookReadyForDownload);
  }


  _wirePubSub() {
    let handlers = {};
    handlers[ClientEvents.REQUEST_SERVER_STATUS]  = this._handleRequestServerStatus;
    handlers[ClientEvents.REQUEST_BOOKS]          = this._handleRequestBooks;
    handlers[ClientEvents.BOOK_SELECTION_CHANGED] = this._handleBookSelectionChanged;
    handlers[ClientEvents.SORT_CHANGED]           = this._handleSortChanged;
    handlers[ClientEvents.SEARCH_CHANGED]         = this._handleSearchChanged;
    handlers[ClientEvents.EDIT_BOOK]              = this._handleBookEdit;
    PubSub.subscribeWithMap(handlers);
  }


  @autobind
  _handleBookEdit(payload) {
    if (payload.invoked)
      this._setState({
        isEditingBooks: true
      });
    else if (payload.closed) {
      this.doRefresh();
      this._setState({
        isEditingBooks: false
      });
    }
  }


  @autobind
  _handleScannerStarted() {
    this._setState({
      isScanning: true
    });
  }


  @autobind
  _handleScannerStopped() {
    this._setState({
      isScanning: false
    });
  }


  @autobind
  _handleSortChanged(payload) {
    let oldSortModel = this._state.sortModel;
    let sortModel;
    if (payload.columnName === oldSortModel.columnName) {
      sortModel = new SortModel(oldSortModel.columnName, !oldSortModel.isAscending);
    } else {
      sortModel = new SortModel(payload.columnName, true);
    }
    PubSub.broadcast(ClientEvents.REQUEST_BOOKS, {
      sortModel: sortModel,
      replaceBooks: true
    });
  }


  @autobind
  _handleSearchChanged(searchString) {
    PubSub.broadcast(ClientEvents.REQUEST_BOOKS, {
      filter: Store.buildFullTextSearchFilter(searchString),
      replaceBooks: true
    });
  }


  @autobind
  _handleRequestBooks({from, numItems, sortModel, filter, replaceBooks} = {}) {
    let state = this._state;
    if (state.isBusy)
      return;

    this.setBusy(true);
    sortModel = sortModel || state.sortModel;
    Net.getBooks(new PagerModel(from, from + numItems), sortModel, filter, replaceBooks)
    .then(this._onGetBooksResponse)
    .catch(this._handleError);
  }


  @autobind
  _onGetBooksResponse({books, sort, pager, filter, replaceBooks}) {
    let state = this._state;
    sort = sort || state.sortModel;
    let res = {
      totalBooksInSystem: pager.totalBooksInSystem,
      sortModel: sort,
      searchString: Store.getSearchStringFromFullTextSearchFilter(filter),
      isBusy: false
    };

    if (replaceBooks) {
      res.books = books;
      res.bookListStartRowNumber = 0;

    } else {
      res.books = state.books.concat(books);
      res.bookListStartRowNumber = undefined;
    }

    this._setState(res);
  }


  @autobind
  _handleRequestServerStatus() {
    //console.log('Request server status');
  }


  @autobind
  _handleError(err) {
    console.error(err.stack);
    alert(err.message);
    this._setState({
      isBusy: false
    })
  }


  @autobind
  _handleBookReadyForDownload(payload) {
    this._setState({
      booksReadyForDownload: this._state.booksReadyForDownload.concat([payload])
    });
  }


  /**
  Expect payload of shape
  {
    id: number,
    isSelected: boolean
  }
  */
  @autobind
  _handleBookSelectionChanged(payload) {
    let currentIdMap = Object.assign({}, this._state.selectedBookIdMap);
    if (payload.isSelected) {
      currentIdMap[payload.id] = true;
    } else {
      delete currentIdMap[payload.id];
    }
    this._setState({
      selectedBookIdMap: currentIdMap
    });
  }


  _emitChange() {
    this._listeners.forEach((fn) => fn(this._state));
  }


  doRefresh() {
    console.log('REFRESH. TODO.');
  }


  @autobind
  setBusy(isBusy) {
    this._setState({
      isBusy: true
    });
  }


  getState() {
    return Object.assign({}, this._state);
  }


  subscribe(fn) {
    if (this._listeners.indexOf(fn) === -1)
      this._listeners.push(fn);
  }


  unsubscribe(fn) {
    this._listeners = this._listeners.filter(function(f) {
      return f !== fn;
    });
  }
}


let instance = null;
function getInstance() {
  if (!instance)
    instance = new Store();
  return instance;
}


module.exports = {
  getInstance: getInstance
};
