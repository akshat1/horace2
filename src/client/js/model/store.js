/*
  An alternative approach to flux/redux ideal of uni-directional data flow.
*/


const PubSub   = require('../util/pubsub.js');
const Net      = require('../util/net.js');
const autobind = require('autobind-decorator');
const {SortModel, PagerModel} = require('../../../app/model/library-model.js');
const {Client: ClientEvents, Server: ServerEvents} = require('../../../app/events.js');
const {applySequence} = require('./transforms.js');


class Store {
  constructor() {
    this._listeners = [];
    this._state = this._getInitialState();
    this._wireWebSockets();
    this._wirePubSub();
  }


  _setState(addendum) {
    this._state = applySequence(Object.assign(this._state, addendum));
    this._emitChange();
  }


  _getInitialState() {
    return {
      isScanning        : false,
      isBusy            : false,
      books             : [],
      selectedBookIdMap : {},
      selectedBooks     : [],
      notifications     : [],
      sortModel         : new SortModel('title', true)
    };
  }


  _wireWebSockets() {
    Net.onWebSocket(ServerEvents.SCANNER_SCANSTARTED, this._handleScannerStarted);
    Net.onWebSocket(ServerEvents.SCANNER_SCANSTOPPED, this._handleScannerStopped);
    Net.onWebSocket(ServerEvents.BOOK_READY_FOR_DOWNLOAD, this._handleBookReadyForDownload);
  }


  _wirePubSub() {
    PubSub.subscribe(ClientEvents.REQUEST_SERVER_STATUS, this._handleRequestServerStatus);
    PubSub.subscribe(ClientEvents.REQUEST_BOOKS, this._handleRequestBooks);
    PubSub.subscribe(ClientEvents.BOOK_SELECTION_CHANGED, this._handleBookSelectionChanged);
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
  _handleBookReadyForDownload() {
    //console.log('Book ready for download');
  }


  @autobind
  _handleRequestBooks(opts = {}) {
    let {from, numItems} = opts;
    if (this._state.isBusy)
      return;

    this.setBusy(true);
    Net.getBooks(new PagerModel(from, from + numItems), this._state.sortModel)
    .then(this._onGetBooksResponse)
    .catch(this._handleError);
  }


  @autobind
  _onGetBooksResponse({books}) {
    this._setState({
      books: this._state.books.concat(books),
      isBusy: false
    });
  }


  @autobind
  _handleRequestServerStatus() {
    //console.log('Request server status');
  }


  _handleError(err) {
    console.error(err.stack);
    alert(err.message);
    this._setState({
      isBusy: false
    })
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
