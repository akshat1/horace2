'use strict';

import React from 'react';
import autobind from 'autobind-decorator';

import * as PubSub from './../util/pubsub.js'


/**
whether or not child is a descendent of parent
*/
function isDOMDescendentOf(child, parent){
  if (child.parentNode === parent)
    return true
  if (child.parentNode)
    return isDOMDescendentOf(child.parentNode, parent);
  else
    return false;
}


class MenuView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {}
    };
  }


  componentWillMount() {
    var style = this.calculateStyle(this.props.view.trigger);
    this.setState({
      style: style
    });
  }


  calculateStyle(trigger) {
    var style = {};
    if(trigger) {
      var bcr = trigger.getBoundingClientRect();
      style['top'] = bcr.top + bcr.height;
      style['left'] = bcr.left;
    }
    return style;
  }


  hide() {
    this.props.hide(this.props.view);
  }


  @autobind
  handleClickOnBody(e) {
    if(isDOMDescendentOf(e.target, this.refs['root'].getDOMNode())) {
      if (this.props.hideOnEveryClick)
        this.hide();
    } else {
      this.hide();
    }
  }


  componentDidMount() {
    document.body.addEventListener('click', this.handleClickOnBody);
  }


  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleClickOnBody);
  }


  @autobind
  renderMenuItems() {
    return this.props.view.items.map(function(i){
      return (
        <div className='h-menu-item'>{i}</div>
      );
    });
  }


  render() {
    return (
      <div className={`h-menu`} style={this.state.style} tabIndex={999} ref='root'>
        {this.renderMenuItems()}
      </div>
    );
  }
}


class MenuRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      views: []
    };

    PubSub.subscribe('menu.clicked', this.handleMenuClick);
    PubSub.subscribe('menu.updated', this.handleMenuUpdate);
  }


  replaceView(payload) {
    var views = this.state.views.filter(function(v) {
      return v.key !== payload.key;
    });
    if(payload.items.length > 0)
      views.push(payload);
    this.setState({
      views: views
    });
  }


  @autobind
  handleMenuClick(payload) {
    this.replaceView(payload);
  }


  @autobind
  handleMenuUpdate(payload) {
    //TODO: Optimise this
    var view = this.state.views.find(function(v) {
      return v.key === payload.key;
    });
    if(!view) //This isn't visible, so we are no longer concerned with it.
      return;
    this.replaceView(payload);
  }


  @autobind
  hideView(view) {
    var views = this.state.views.filter(function(v) {
      return v.key !== view.key;
    });
    this.setState({
      views: views
    });
  }


  @autobind
  renderMenuViews() {
    var _self = this;
    return this.state.views.map(function(v) {
      return <MenuView view={v} hide={_self.hideView}/>;
    });
  }


  render() {
    return (
      <div className='h-menu-renderer'>
        {this.renderMenuViews()}
      </div>
    );
  }
}

export default MenuRenderer;
