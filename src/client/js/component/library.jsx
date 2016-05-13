'use strict';

const React = require('react');
const autobind = require('autobind-decorator');
const _ = require('lodash');
const PubSub = require('./../util/pubsub.js');
const BookList = require('./book-list.jsx')
const HEvents = require('./../../../app/events.js');
const ClientEvents = HEvents.Client;
const ServerEvents = HEvents.Server;
const Net = require('./../util/net.js');
const HModel = require('./../../../app/model/library-model.js');
const PagerModel = HModel.PagerModel;
const SortModel = HModel.SortModel;
const DEFAULT_PAGER_PAGE_SIZE = HModel.DEFAULT_PAGER_PAGE_SIZE;

class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;

    this.state = {
      isPerformingBlockingAction : false,
      books                      : [],
      selectedBooks              : [],
      bookPager                  : new PagerModel(),
      bookSort                   : new SortModel('title', true),
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
      console.log('scanning started');
    }.bind(this));

    Net.onWebSocket(ServerEvents.SCANNER_SCANSTOPPED, function(){
      console.log('scanning stopped');
    }.bind(this));

    Net.onWebSocket(ServerEvents.BOOK_READY_FOR_DOWNLOAD, function(payload){
      console.log('File ready for download');
    }.bind(this));
  }


  @autobind
  wirePubSub() {
    PubSub.subscribe(ClientEvents.LOAD_MORE_BOOKS, this.loadMoreBooks);
  }


  @autobind
  handleBooksResponse(res) {
    res.books = this.state.books.concat(res.books);
    res.isPerformingBlockingAction = false;
    this.setState(res);
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
    let filter = {};
    Net.getBooks(pager, sort, filter)
      .then(this.handleBooksResponse)
      .catch(this.handleError);
  }


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
  componentDidMount() {
    this.fetchBooks({});
    Net.isServerScanningForBooks()
      .then(this.setScanning)
      .catch(function(err){
        console.error('Error finding out if server is currently scanning', err);
      });
    setTimeout(this.generateNotification, 500);
  }


  renderBookList() {
    let state     = this.state;
    let bookPager = state.bookPager;
    let bookSort  = state.bookSort;
    return (
      <BookList
        isPerformingBlockingAction = {state.isPerformingBlockingAction}
        books                      = {state.books}
        selectedBooks              = {state.selectedBooks}
        sortColumn                 = {bookSort.columnName}
        sortAscending              = {bookSort.isAscending}
      />
    );
  }


  render() {
    return (
      <div className='h-library'>
        {this.renderBookList()}
      </div>
    );
  }//render
}//Library

module.exports = Library;