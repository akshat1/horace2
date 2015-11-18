'use strict';
import React from 'react';
import autobind from 'autobind-decorator';


const Style = {
  Root   : 'h-server-scanning-status'
};


class ScanningStatus extends React.Component {
  constructor(props) {
    super(props);
  }


  getStyleClass() {
    return Style.Root;
  }


  @autobind
  handleClick() {
    if(typeof this.props.onClick)
      this.props.onClick.apply(this, arguments);
  }


  getActiveComponent() {
    return <span className='fa fa-clock-o fa-spin'/>;
  }


  getInactiveComponent() {
    return <span className='fa fa-clock-o'/>;
  }


  getContentComponent() {
    return this.props.isActive ? this.getActiveComponent() : this.getInactiveComponent();
  }


  render() {
    return (
      <div className={this.getStyleClass()} title='Scanning for Books' onClick={this.handleClick}>
        {this.getContentComponent()}
      </div>
    );
  }

}

export default ScanningStatus;
