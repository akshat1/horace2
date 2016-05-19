'use strict';

const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const {Client: ClientEvents, Server: ServerEvents} = require('./../../../app/events.js');
const Store = require('../model/store.js');

const BookList = require('./book-list.jsx')
const Toolbar  = require('./toolbar.jsx');


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
    this._store     = Store.getInstance();
    this.state      = this._store.getState();
    this._store.subscribe(this._handleStoreChanged);
  }


  @autobind
  _handleStoreChanged(newState) {
    this.setState(newState);
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
      </div>
    );
  }//render
}//Library

module.exports = Library;