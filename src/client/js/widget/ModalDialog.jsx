'use strict';
const React    = require('react');
const Modal    = require('./Modal.jsx');
const _        = require('lodash');
const autobind = require('autobind-decorator');
const {
  Button,
  ButtonType
} = require('simian-react-button');
const {
  findElement
} = require('../util/react-utils.js');


const StyleClass = {
  ROOT             : 'h-modal-dialog',
  HIDDEN           : 'h-modal-dialog-hidden',
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
    this.state = {
      isVisible: true
    };
    window._md = this;
  }


  @autobind
  handleCloseButtonClicked() {
    let {
      onBeforeClose = _.noop,
      onClose = _.noop
    } = this.props;

    onBeforeClose();
    this.setState({
      isVisible: false
    });
    onClose();
  }


  renderVisible() {
    let props = this.props;
    let {
      className = '',
      children
    } = props;
    let title   = findElement(children, ModalDialogTitle);
    let body    = findElement(children, ModalDialogBody);
    let buttons = findElement(children, ModalDialogButtons);
    let footer  = findElement(children, ModalDialogFooter);

    return (
      <div className = {`${StyleClass.ROOT} ${className}`}>
        <Modal>
          <ModalDialogTitle
            onClose = {this.handleCloseButtonClicked}
          >
            {title.props.children}
          </ModalDialogTitle>
          {body}
          {buttons}
          {footer}
        </Modal>
      </div>
    );
  }


  render() {
    if (this.state.isVisible) {
      return this.renderVisible();
    } else {
      return (
        <div className = {`${StyleClass.ROOT} ${this.props.className} ${StyleClass.HIDDEN}`}>
        </div>
      );
    }
  }
}


ModalDialog.propTypes = {
  onBeforeClose : React.PropTypes.func,
  onClose       : React.PropTypes.func,
  className     : React.PropTypes.string
};



const ModalDialogTitle = (props) =>
  <div className = {StyleClass.TITLE}>
    <div className = {StyleClass.TITLECONTENTS}>
      {props.children}
    </div>
    <Button
      className = {StyleClass.TITLECLOSEBUTTON}
      type      = {ButtonType.CLOSE}
      onClick   = {props.onClose}
    />
  </div>


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
