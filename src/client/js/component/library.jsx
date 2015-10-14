'use strict';

import EventEmitter from 'events';
import React from 'react';
import BookList from './book-list.jsx';
import ScanningStatus from './scanning-status.jsx';

import HoraceEvents from './../../../app/events.js';
import * as Net from './../util/net.js';
import autobind from 'autobind-decorator';


const ServerEvents = HoraceEvents.Server;

class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;

    this.state = {
      isScanning: false
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
  }


  @autobind
  componentDidMount() {
    this.wireWebSockets();
    Net.isServerScanningForBooks()
      .then(this.setScanning)
      .catch(function(err){
        console.error('Error findind out if server is currently scanning');
      });
  }


  @autobind
  startScanning() {
    if(!this.state.isScanning)
      Net.doStartScanning();
  }


  @autobind
  getServerStatusIndicators() {
    var components = [];
    components.push(<ScanningStatus isActive={this.state.isScanning} onClick={this.startScanning}/>);

    return (
      <div className='h-toolbar-item h-tool-bar-server-status-container'>
        {components}
      </div>
    );
  }


  render() {
    return (
      <div className='h-library'>
        <div className='h-tool-bar'>
          <div className='h-toolbar-section-left'/>
          <div className='h-toolbar-section-center'/>
          <div className='h-toolbar-section-right'>
            {this.getServerStatusIndicators()}
            <div className='h-toolbar-item h-logo'>
              Horace
            </div>
          </div>
        </div>
        <BookList/>
      </div>
    );
  }//render
}//Library

export default Library;