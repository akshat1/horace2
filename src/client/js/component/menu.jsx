'use strict';

var React = require('react');
var autobind = require('autobind-decorator');
var _ = require('lodash');

var PubSub = require('./../util/pubsub.js');


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
  handleClick() {
    if(this.props.disabled)
      return;
    PubSub.broadcast('menu.clicked', this.getBroadcastPayload());
  }


  getBroadcastPayload() {
    return {
      key       : this.getKey(),
      trigger   : this.refs['trigger'],
      items     : this.props.items,
      className : this.props.className
    };
  }


  @autobind
  componentDidUpdate() {
    PubSub.broadcast('menu.updated', this.getBroadcastPayload());
  }


  getRootStyleClass() {
    return `h-trigger h-menu-trigger ${this.props.disabled ? 'disabled' : 'enabled'} ${this.props.className || ''}`;
  }


  getChildren() {
    return this.props.children;
  }


  render() {
    return (
      <div className={this.getRootStyleClass()} onClick={this.handleClick} ref='trigger'>
        {this.getChildren()}
      </div>
    );
  }
}

module.exports = Menu;