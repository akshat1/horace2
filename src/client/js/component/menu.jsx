'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import _ from 'lodash';

import PubSub from './../util/pubsub.js'


/**
props = {
  Items: [React Component]
}
*/
class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.key = _.uniqueId('Menu_');
  }


  getKey() {
    return this.key;
  }


  @autobind
  handleClick(e) {
    if(this.props.disabled)
      return;
    PubSub.broadcast('menu.clicked', this.getBroadcastPayload());
  }


  getBroadcastPayload() {
    return {
      key       : this.getKey(),
      trigger   : this.refs['trigger'].getDOMNode(),
      items     : this.props.items,
      className : this.props.className
    };
  }


  @autobind
  componentDidUpdate(nextProps, nextState) {
    PubSub.broadcast('menu.updated', this.getBroadcastPayload());
  }


  getRootStyleClass() {
    return `h-menu-trigger ${this.props.disabled ? 'disabled' : 'enabled'} ${this.props.className || ''}`;
  }


  render() {
    return (
      <div className={this.getRootStyleClass()} onClick={this.handleClick} ref='trigger'>
        {this.props.children}
      </div>
    );
  }
}

export default Menu;