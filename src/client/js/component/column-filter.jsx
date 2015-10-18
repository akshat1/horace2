'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import Popup from './popup.jsx';


class ColumnFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    }
  }


  @autobind
  collapse() {
    this.setState({
      expanded: false,
      filterOptions: []
    });
  }


  @autobind
  expand(x, y) {
    this.props.getOptions()
    .then(function(options) {
      this.setState({
        expanded: true,
        clickX: x,
        clickY: y,
        options: options
      });
    }.bind(this))
    .catch(function(err) {
      console.error(err);
    });
  }


  @autobind
  handleClick(e) {
    this.expand(0, e.currentTarget.clientHeight);
  }


  renderFilterOptions() {
    /*
    var options = this.props.options;
    var optionComponents = options.map(function(o) {
      return (
        <div className='h-filter-option'>
          <label>
            <input type='checkbox'/>
            {o}
          </label>
        </div>
      );
    });
    */
    return [<div className='h-filter-option'>
        <label>
          <input type='checkbox'/>
          Sample
        </label>
      </div>];
  }


  @autobind
  renderPopup() {
    if (this.state.expanded) {
      return (
        <Popup top={this.state.clickY} left={this.state.clickX} items={this.renderFilterOptions()} hide={this.collapse} ref='popup'/>
      );
    }
  }


  render() {
    return (
      <div className='h-column-filter' onClick={this.handleClick}>
        <span className='fa fa-filter'/>
        {this.renderPopup()}
      </div>
    );
  }
}

export default ColumnFilter;
