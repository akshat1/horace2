'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import Popup from './popup.jsx';


class NotificationWrapper extends React.Component {
  constructor(props) {
    super(props);
  }


  getNotificationComponent() {
    return this.props.notificationContent;
  }


  @autobind
  dismiss() {
    this.props.dismiss(this);
  }


  render() {
    return (
      <div className='h-notification'>
        <div className='h-notification-content'>
          {this.getNotificationComponent()}
        </div>
        <div className='h-notification-dismisser' onClick={this.dismiss}>
          <span className='fa fa-trash-o'/>
        </div>
      </div>
    );
  }
}


class NotificationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    }
  }


  hasNotifications() {
    return this.props.notifications && this.props.notifications.length;
  }


  @autobind
  handleClick(e) {
    var targetElement = e.currentTarget;
    this.setState({
      expanded: true,
      clickX: 0,
      clickY: targetElement.clientHeight
    });
  }


  @autobind
  collapse() {
    this.setState({
      expanded: false
    });
  }


  getRootStyle() {
    return `h-notification-list-trigger h-toolbar-item ${this.hasNotifications() ? 'active' : ''}`;
  }


  getNotifications() {
    var _self = this;
    return this.props.notifications.map(function(n) {
      var dismiss = function() {
        _self.props.dismiss(n);
      }
      return <NotificationWrapper notificationContent={n} dismiss={dismiss}/>
    });
  }


  @autobind
  getPopup() {
    if(this.state.expanded) {
      return (
        <Popup top={this.state.clickY} left={this.state.clickX} items={this.getNotifications()} hide={this.collapse} ref='popup'/>
      );
    }
  }


  @autobind
  componentDidMount() {}


  render() {
    return (
      <div className={this.getRootStyle()} onClick={this.handleClick}>
        <span className='fa fa-bell'/>
        {this.getPopup()}
      </div>
    );
  }
}

export default NotificationList;
