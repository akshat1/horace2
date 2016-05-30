'use strict';

const React = require('react');
const autobind = require('autobind-decorator');
const {Growl, GrowlType} = require('./growl.jsx');
const PubSub = require('./../util/pubsub.js');
const Net = require('./../util/net.js');
const {Client: ClientEvents, Server: ServerEvents} = require('./../../../app/events.js');
const Store = require('../model/store.js');

const BookList = require('./book-list.jsx')
const Toolbar  = require('./toolbar.jsx');

const {
  ModalDialog,
  ModalDialogTitle,
  ModalDialogBody,
  ModalDialogButtons,
  ModalDialogFooter
} = require('../widget/ModalDialog.jsx');


const StyleClass = {
  ROOT: 'h-library'
}


const RefName = {
  ROOT : 'h-library-root'
}


class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;
    window.PubSub = PubSub;
    this._store     = Store.getInstance();
    this.state      = this._store.getState();
    this._store.subscribe(this.handleStoreChanged);
    Net.onWebSocket(ServerEvents.BOOK_READY_FOR_DOWNLOAD, this.handleBookReadyForDownload);
  }


  @autobind
  handleStoreChanged(newState) {
    this.setState(newState);
  }


  @autobind
  handleBookReadyForDownload(payload) {
    let {path: fileLocation, title, bookId} = payload;
    let downloadBook = function() {
      Net.downloadFile(fileLocation);
      PubSub.broadcast(ClientEvents.GROWL, {
        id: `${bookId}-ready`,
        dispose: true
      });
    }

    let message = (
      <span>
        <a href = '#' onClick = {downloadBook}>Download</a>
        &nbsp;
        {title}
      </span>
    );
    // Hide the previous growl
    PubSub.broadcast(ClientEvents.GROWL, {
      id: `preparing-${bookId}`,
      dispose: true
    });
    PubSub.broadcast(ClientEvents.GROWL, {
      id: `${bookId}-ready`,
      message: message,
      type: GrowlType.INFO,
      timeout: 15000
    });
  }


  @autobind
  componentDidMount() {
    PubSub.broadcast(ClientEvents.REQUEST_SERVER_STATUS);
    PubSub.broadcast(ClientEvents.REQUEST_BOOKS);
  }


  renderBookToolbar() {
    let state = this.state;
    return (
      <Toolbar
        selectedBooks = {state.selectedBooks}
        notifications = {state.notifications}
        searchString  = {state.searchString}
        />
    );
  }


  renderBookList() {
    let state = this.state;
    return (
      <BookList
        books                  = {state.books}
        sort                   = {state.sortModel}
        totalBooksInSystem     = {state.totalBooksInSystem}
        bookListStartRowNumber = {state.bookListStartRowNumber}
      />
    );
  }


  render() {
    return (
      <div className = {StyleClass.ROOT} ref = {RefName.ROOT}>
        {this.renderBookToolbar()}
        {this.renderBookList()}
        <Growl />
      </div>
    );
  }
}

module.exports = Library;