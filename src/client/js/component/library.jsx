'use strict';

const React = require('react');
const autobind = require('autobind-decorator');
const _ = require('lodash');
const PubSub = require('./../util/pubsub.js');
const BookList = require('./book-list.jsx')
const {Client: ClientEvents, Server: ServerEvents} = require('./../../../app/events.js');
const Store = require('../model/store.js')

class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;
    this._store = Store.getInstance();
    this.state = this._store.getState();
    this._store.subscribe(this._handleStoreChanged);
  }//constructor


  @autobind
  _handleStoreChanged(newState) {
    this.setState(newState);
  }


  @autobind
  componentDidMount() {
    PubSub.broadcast(ClientEvents.REQUEST_SERVER_STATUS);
    PubSub.broadcast(ClientEvents.REQUEST_BOOKS);
  }


  renderBookList() {
    let state = this.state;
    return (
      <BookList
        books = {state.books}
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