'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const {Client: ClientEvents, Server: ServerEvents} = require('../../../app/events.js');
const {Button} = require('../widget/Button.jsx');
const {
  ModalDialog,
  ModalDialogTitle,
  ModalDialogBody,
  ModalDialogButtons,
  ModalDialogFooter
} = require('../widget/ModalDialog.jsx');


const StyleClass = {
  ROOT: 'h-book-editor'
};


class BookEditor extends React.Component {
  constructor(props) {
    super(props);
  }


  handleClose() {
    PubSub.broadcast(ClientEvents.EDIT_BOOK, {
      closed: true
    });
  }


  render() {
    return (
      <ModalDialog className = {StyleClass.ROOT} onClose = {this.handleClose}>
        <ModalDialogTitle>
          Edit Book
        </ModalDialogTitle>
        <ModalDialogBody>
          Gotta Eat A Pita
        </ModalDialogBody>
        <ModalDialogButtons>
          <Button
            label      = 'Reset'
            faIconName = 'rotate-left'
          />
          <Button
            label      = 'Cancel'
            faIconName = 'close'
          />
          <Button
            label      = 'Save'
            faIconName = 'check'
            primary    = {true}
          />
        </ModalDialogButtons>
      </ModalDialog>
    );
  }
}


module.exports = BookEditor;
