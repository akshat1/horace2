'use strict';

import React from 'react';
import autobind from 'autobind-decorator';


const HIDE_WAIT = 200;

/**
 props = {
  id: String,
  top: int,
  left: int,
  hide: function
  items: [React.Component]
 }
*/
class Popup extends React.Component {
  static getId() {
    if (!Popup._count)
      Popup._count = 0;

    return `hPopup_${Popup._count++}`;
  }


  constructor(props) {
    super(props);
    this.id = props.id || Popup.getId();
    window._popup = this;
  }


  getStyle() {
    return {
      top: this.props.top,
      left: this.props.left
    };
  }


  @autobind
  componentDidMount() {
    this.refs['popupElement'].getDOMNode().focus();
  }


  getItems() {
    return this.props.items.map(function(i) {
      return <div className='h-popup-item'>{i}</div>;
    });
  }


  hide() {
    setTimeout(this.props.hide, HIDE_WAIT);
  }

  @autobind
  handleClick(e) {
    this.hide();
  }


  @autobind
  handleBlur() {
    this.hide();
  }


  render() {
    return (
      <div className='h-popup' style={this.getStyle()} onBlur={this.handleBlur} onClick={this.handleClick} tabIndex={999} id={this.id} ref='popupElement'>
        {this.getItems()}
      </div>
    );
  }
}

export default Popup;