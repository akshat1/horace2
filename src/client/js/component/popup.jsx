'use strict';

import React from 'react';
import autobind from 'autobind-decorator';


const FILTER_DEBOUNCE_INTERVAL = 750;


class Popup extends React.Component {
  constructor(props) {
    super(props);
  }


  @autobind
  getClassName() {
    return `${this.props.className} h-popup`;
  }


  renderTitleBar() {
    return (
      <div className='h-popup-title'>
        <div className='h-popup-title-contents'>
          {this.props.title}
        </div>
        <div className='h-popup-title-controls'>
          <button onClick={this.props.dismiss} className='h-popup-close fa fa-times'></button>
        </div>
      </div>
    );
  }


  @autobind
  handleKeyUp(evt) {
    // Hide the dialog if escape key was pressed
    if(evt.keyCode === 27)
      this.props.dismiss();
  }


  componentDidMount() {
    document.body.addEventListener('keyup', this.handleKeyUp);
  }


  componentWillUnmount() {
    document.body.removeEventListener('keyup', this.handleKeyUp);
  }


  render() {
    return (<div className={this.getClassName()}>
      <div className='h-popup-contents'>
        {this.renderTitleBar()}
        <div className='h-popup-body'>
          {this.props.children}
        </div>
      </div>
    </div>);
  }
}

export default Popup;
