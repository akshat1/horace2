'use strict';
var React = require('react');
var autobind = require('autobind-decorator');
var PubSub = require('./../util/pubsub.js');
var ClientEvents = require('./../../../app/events.js').Client;
var NotificationList = require('./notification-list.jsx');


class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let props = this.props;
    return (
      <div className='h-tool-bar'>
        <div className='h-toolbar-section-left'>
          <NotificationList notifications={props.notifications}/>
          <div className='h-trigger h-settings-trigger fa fa-gear' title='Settings'/>
        </div>
        <div className='h-toolbar-section-center'/>
        <div className='h-toolbar-section-right'>
          {props.serverStatusIndicators}
          <div className='h-toolbar-item h-logo'>
            Horace
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Toolbar;