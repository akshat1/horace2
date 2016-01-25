'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import Menu from './menu.jsx';
import PubSub from './../util/pubsub.js';
import {Client as ClientEvents, Server as ServerEvents} from './../../../app/events.js';


class NotificationWrapper extends React.Component {
  constructor(props) {
    super(props);
  }


  getNotificationComponent() {
    return this.props.notificationContent;
  }


  @autobind
  dismiss() {
    PubSub.broadcast(ClientEvents.NOTIFICATION_DISMISS, this.props.notificationContent);
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
    };
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
      return <NotificationWrapper notificationContent={n}/>;
    });
  }


  @autobind
  componentDidMount() {}


  renderTriggerElement() {
    if (this.props.notifications.length)
      return (<span className='fa fa-bell'/>);
    else
      return (<span className='fa fa-bell-o'/>);
  }


  render() {
    return (
      <Menu items={this.getNotifications()} disabled={this.props.notifications.length === 0}>
        {this.renderTriggerElement()}
      </Menu>
    );
  }
}

export default NotificationList;
