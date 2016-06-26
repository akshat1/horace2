'use strict';
const React = require('react');
const setupResizeHandling = require('element-resize-event');
const autobind = require('autobind-decorator');

const StyleClass = {
  ROOT    : 'h-modal',
  W1      : 'h-modal-wrapper-1',
  W2      : 'h-modal-wrapper-2',
  CONTENT : 'h-modal-content'
};


const RefName = {
  CONTENT : 'h-modal-content'
};


class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contentHeight: 'auto'
    };
  }


  getW1Style() {
    return {
      height: this.state.contentHeight
    };
  }


  componentDidMount() {
    setupResizeHandling(this.refs[RefName.CONTENT], this.handleResize);
    this.handleResize();
  }


  @autobind
  handleResize() {
    this.setState({
      contentHeight: this.refs[RefName.CONTENT].clientHeight
    });
  }


  render() {
    let props = this.props;
    let {
      className = ''
    } = props;

    return (
      <div className = {`${StyleClass.ROOT} ${className}`}>
        <div className = {StyleClass.W1} style = {this.getW1Style()}>
          <div className = {StyleClass.W2}>
            <div className = {StyleClass.CONTENT} ref = {RefName.CONTENT}>
              {props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


Modal.propTypes = {
  className: React.PropTypes.string
};


module.exports = Modal;
