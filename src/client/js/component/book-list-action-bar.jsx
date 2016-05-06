'use strict';
var React = require('react');
var autobind = require('autobind-decorator');
var PubSub = require('./../util/pubsub.js');
var ClientEvents = require('./../../../app/events.js').Client;

class BookListActionBar extends React.Component {
  constructor(props) {
    super(props);
  }


  handleEditButtonClick(evt) {
    if(evt.disabled)
      return;
    PubSub.broadcast(ClientEvents.BOOK_EDIT);
  }


  handleHideButtonClick(evt) {
    if(evt.disabled)
      return;
    PubSub.broadcast(ClientEvents.BOOK_HIDE);
  }


  handleDownloadButtonClick(evt) {
    if(evt.disabled)
      return;
    PubSub.broadcast(ClientEvents.BOOK_DOWNLOAD);
  }


  handleClearSelectionClick() {
    console.log('BookListActionBar:handleClearSelectionClick');
    PubSub.broadcast(ClientEvents.SELECTION_CLEAR);
  }


  renderBookSelectionSummary() {
    let props = this.props;
    let selectedBooks = props.selectedBooks;
    if (selectedBooks.length) {
      return (
        <div className='h-book-selection-summary'>
          <button onClick={this.handleClearSelectionClick} title='Clear Selection'>
            <span className='fa fa-close'/>
            &nbsp;Clear Selection
          </button>
          &nbsp;
          {selectedBooks.length}
          &nbsp;
          {selectedBooks.length > 1 ? 'books' : 'book'}
          &nbsp;
          selected.
        </div>
      );
    } else {
      return (
        <div className='h-book-selection-summary'>
        </div>
      );
    }
  }


  renderBookActions() {
    let props = this.props;
    let selectedBooks = props.selectedBooks;
    let disabled = selectedBooks.length === 0;
    return (
      <div className='h-book-actions'>
        <button disabled={disabled} onClick={this.handleEditButtonClick}>
          <span className='fa fa-edit h-icon'/>
          Edit
        </button>
        <button disabled={disabled} onClick={this.handleHideButtonClick}>
          <span className='fa fa-eye-slash h-icon'/>
          Hide
        </button>
        <button disabled={disabled} onClick={this.handleDownloadButtonClick}>
          <span className='fa fa-cloud-download h-icon'/>
          Download
        </button>
      </div>
    );
  }


  render() {
    return (
      <div className='h-action-bar'>
        {this.renderBookSelectionSummary()}
        {this.renderBookActions()}
      </div>
    );
  }
}

module.exports = BookListActionBar;
