'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const _ = require('lodash');
const PubSub = require('./../util/pubsub.js');
const {Client: ClientEvents, Server: ServerEvents} = require('../../../app/events.js');
const Net = require('./../util/net.js');
const {Button} = require('simian-react-button');
const {TextField, TextFieldType} = require('../widget/TextInput.jsx');
const {
  ModalDialog,
  ModalDialogTitle,
  ModalDialogBody,
  ModalDialogButtons,
  ModalDialogFooter
} = require('../widget/ModalDialog.jsx');
const StyleClass = {
  BOOK: {
    ROOT: 'h-book-editor-book'
  },

  EDITOR: {
    ROOT: 'h-book-editor'
  }
};


const RefName = {
  Book: {
    Title    : 'title',
    Year     : 'year',
    Authors  : 'authors',
    Subjects : 'subjects'
  },
  Editor: {
    Book: 'book'
  }
};


class Book extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      book: Object.assign({}, props.book)
    };
  }


  getChangeHandler(propName, factory = _.identity) {
    return function (evt) {
      let newVal = factory(evt.target.value);
      let tmp = {};
      tmp[propName] = newVal;
      let newBook = Object.assign(this.state.book, tmp);
      this.setState({
        book: newBook
      });
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(newBook, this);
      }
    }.bind(this);
  }


  renderRow(opts) {
    let {label, inputControl} = opts;
    return (
      <div>
        <div>
          {label}
        </div>
        <div>
          {inputControl}
        </div>
      </div>
    );
  }


  renderTitleRow() {
    let label = 'Title';
    let inputControl = <TextField
        value    = {this.state.book.title}
        key      = {RefName.Book.Title}
        onChange = {this.getChangeHandler('title')}
      />;
    return this.renderRow({label, inputControl});
  }


  renderAuthorsRow() {
    let label = 'Author';
    let inputControl = <TextField
        value    = {this.state.book.authors}
        key      = {RefName.Book.Authors}
        onChange = {this.getChangeHandler('authors', Book.makeArray)}
      />;
    return this.renderRow({label, inputControl});
  }


  renderYearRow() {
    let label = 'Year';
    let inputControl = <TextField
        value    = {this.state.book.year}
        key      = {RefName.Book.Year}
        onChange = {this.getChangeHandler('year')}
        type     = {TextFieldType.NUMBER}
      />;
    return this.renderRow({label, inputControl});
  }


  renderSubjectsRow() {
    let label = 'Subjects';
    let inputControl = <TextField
        value    = {this.state.book.subjects}
        key      = {RefName.Book.Subjects}
        onChange = {this.getChangeHandler('subjects', Book.makeArray)}
      />;
    return this.renderRow({label, inputControl});
  }


  render() {
    let {
      id,
      title,
      authors,
      subjects,
      year,
      isTheOnlyBook = false
    } = this.props.book;


    return (
      <div className = {StyleClass.BOOK.ROOT} key = {RefName.Book.Title}>
        {this.renderTitleRow()}
        {this.renderAuthorsRow()}
        {this.renderYearRow()}
        {this.renderSubjectsRow()}
      </div>
    );
  }


  static makeArray(x) {
    return [x];
  }
}


class BookEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dirtyBooks: []
    };
  }


  doClose(updatedBooks) {
    PubSub.broadcast(ClientEvents.EDIT_BOOK, {
      closed: true,
      updatedBooks: updatedBooks
    });
  }


  handleClose() {
    this.doClose();
  }


  hasDirtyBooks() {
    return this.state.dirtyBooks.length > 0;
  }


  // --------------------------------------------------------------------------
  @autobind
  handleUpdateSuccessful() {
    console.log(arguments);
    this.doClose(this.state.dirtyBooks);
  }


  @autobind
  handleUpdateFailed(err) {
    throw err;
  }


  @autobind
  handleSaveButtonClicked() {
    Net.updateBooks(this.state.dirtyBooks)
      .then(this.handleUpdateSuccessful)
      .catch(this.handleUpdateFailed);
  }


  // --------------------------------------------------------------------------
  renderTitle() {
    return (
      <ModalDialogTitle>
        Edit Book
      </ModalDialogTitle>
    );
  }


  @autobind
  handleBookChanged(book) {
    console.log('add %O to dirty books', book);
    let dirtyBooks = this.state.dirtyBooks;
    if (dirtyBooks.indexOf(book) === -1)
      this.setState({
        dirtyBooks: dirtyBooks.concat([book])
      });
  }


  renderNoBooks() {
    return (
      <div>I seem to be missing books to render</div>
    );
  }


  renderSingleBook() {
    return (
      <Book
        key  = {RefName.Editor.Book}
        book = {this.props.books[0]}
        onChange = {this.handleBookChanged}
      />
    );
  }


  renderMultipleBooks() {
    return (
      <div>Multiple Books</div>
    );
  }


  renderBody() {
    let body = null;
    let numBooks = this.props.books.length;
    if (numBooks === 0)
      body = this.renderNoBooks();
    else if (numBooks === 1)
      body = this.renderSingleBook();
    else
      body = this.renderMultipleBooks();

    return (
      <ModalDialogBody>
        {body}
      </ModalDialogBody>
    );
  }


  renderButtons() {
    console.log('Render buttons; Disabled? ', !this.hasDirtyBooks());
    return (
      <ModalDialogButtons>
        <Button
          label      = 'Reset'
          faIconName = 'rotate-left'
          disabled   = {true}
        />
        <Button
          label      = 'Cancel'
          faIconName = 'close'
          onClick    = {this.handleClose}
        />
        <Button
          label      = 'Save'
          faIconName = 'check'
          primary    = {true}
          disabled   = {!this.hasDirtyBooks()}
          onClick    = {this.handleSaveButtonClicked}
        />
      </ModalDialogButtons>
    );
  }


  render() {
    return (
      <ModalDialog className = {StyleClass.EDITOR.ROOT} onClose = {this.handleClose}>
        {this.renderTitle()}
        {this.renderBody()}
        {this.renderButtons()}
      </ModalDialog>
    );
  }
}


module.exports = BookEditor;
