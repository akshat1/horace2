'use strict';
const React = require('react');
const Modal = require('./Modal.jsx');
const {
  Button,
  ButtonType
} = require('../widget/Button.jsx');


const StyleClass = {
  ROOT             : 'h-modal-dialog',
  TITLE            : 'h-modal-dialog-title',
  TITLECONTENTS    : 'h-modal-dialog-title-contents',
  TITLECLOSEBUTTON : 'h-modal-dialog-title-close-button',
  BODY             : 'h-modal-dialog-body',
  FOOTER           : 'h-modal-dialog-footer',
  DIALOGBUTTONS    : 'h-modal-dialog-buttons'
};


class ModalDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  render() {
    let props = this.props;
    let {
      className
    } = props;
    return (
      <div className = {`${StyleClass.ROOT} ${className}`}>
        <Modal>
          {props.children}
        </Modal>
      </div>
    );
  }
}


class ModalDialogTitle extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let props = this.props;
    return (
      <div className = {StyleClass.TITLE}>
        <div className = {StyleClass.TITLECONTENTS}>
          {props.children}
        </div>
        <Button
          className = {StyleClass.TITLECLOSEBUTTON}
          type      = {ButtonType.Close}
        />
      </div>
    );
  }
}


const ModalDialogBody = (props) =>
  <div className = {StyleClass.BODY}>
    {props.children}
  </div>


const ModalDialogFooter = (props) =>
  <div className = {StyleClass.FOOTER}>
    {props.children}
  </div>


const ModalDialogButtons = (props) =>
  <div className = {StyleClass.DIALOGBUTTONS}>
    {props.children}
  </div>


module.exports = {
  ModalDialog,
  ModalDialogTitle,
  ModalDialogBody,
  ModalDialogFooter,
  ModalDialogButtons
};
