'use strict';

import EventEmitter from 'events';
import React from 'react';
import Path from 'path';
import autobind from 'autobind-decorator';

import BookList from './book-list.jsx';
import MenuRenderer from './menu-renderer.jsx';
import ScanningStatus from './scanning-status.jsx';
import NotificationList from './notification-list.jsx';
import HoraceEvents from './../../../app/events.js';
import * as Net from './../util/net.js';
window.Net = Net;

const ServerEvents = HoraceEvents.Server;

class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;

    this.state = {
      isScanning: false,
      notifications: []
    }
  }//constructor


  @autobind
  setScanning(isScanning) {
    this.setState({isScanning: isScanning});
  }


  wireWebSockets() {
    Net.onWebSocket(ServerEvents.SCANNER_SCANSTARTED, function(){
      this.setState({isScanning: true});
    }.bind(this));

    Net.onWebSocket(ServerEvents.SCANNER_SCANSTOPPED, function(){
      this.setState({isScanning: false});
    }.bind(this));

    Net.onWebSocket(ServerEvents.BOOK_READY_FOR_DOWNLOAD, function(payload){
      this.generateFileDownloadNotification(payload.path);
    }.bind(this));
  }


  @autobind
  generateFileDownloadNotification(filePath) {
    var fileName = Path.basename(filePath);
    var notifications = this.state.notifications;
    notifications.push (<div className='h-file-download'>
        Download Ready:&nbsp;
        <a href={filePath}>{fileName}</a>
      </div>);
    this.setState({notifications: notifications});
  }


  @autobind
  componentDidMount() {
    this.wireWebSockets();
    Net.isServerScanningForBooks()
      .then(this.setScanning)
      .catch(function(err){
        console.error('Error findind out if server is currently scanning');
      });
    setTimeout(this.generateNotification, 500);
  }


  @autobind
  startScanning() {
    if(!this.state.isScanning)
      Net.doStartScanning();
  }


  @autobind
  getServerStatusIndicators() {
    var components = [];
    components.push(<ScanningStatus key='server.status.scanning' isActive={this.state.isScanning} onClick={this.startScanning}/>);

    return (
      <div className='h-toolbar-item h-tool-bar-server-status-container'>
        {components}
      </div>
    );
  }


  @autobind
  dismissNotification(notification) {
    var notifications = this.state.notifications.filter(function(n) {
      return n!== notification;
    });
    this.setState({
      notifications: notifications
    });
  }


  render() {
    return (
      <div className='h-library'>
        <div className='h-tool-bar'>
          <div className='h-toolbar-section-left'>
            <NotificationList notifications={this.state.notifications} dismiss={this.dismissNotification}/>
          </div>
          <div className='h-toolbar-section-center'/>
          <div className='h-toolbar-section-right'>
            {this.getServerStatusIndicators()}
            <div className='h-toolbar-item h-logo'>
              Horace
            </div>
          </div>
        </div>
        <BookList/>
        <MenuRenderer/>
      </div>
    );
  }//render
}//Library

export default Library;