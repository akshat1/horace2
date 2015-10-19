'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import Menu from './menu.jsx';
import _ from 'lodash';


const FILTER_DEBOUNCE_INTERVAL = 1000;


function isValueSelected(value, selectedValues) {
  return selectedValues && selectedValues.indexOf(value) >= 0;
}


class ColumnFilterOption extends React.Component {
  constructor(props) {
    super(props);
  }


  @autobind
  handleChange(e) {
    var value = this.props.value;
    var isSelected = this.refs['checkbox'].getDOMNode().checked;
    this.props.updateFilterSelection(value, isSelected);
  }


  render() {
    return (
      <label key={this.props.key}>
        <input type='checkbox' onChange={this.handleChange} ref='checkbox'/>
        {this.props.label}
      </label>
    );
  }
}


class ColumnFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.selectedValuesMap = {};
    window._CFilter = this;
    this.updateFilter = _.debounce(this.updateFilter, FILTER_DEBOUNCE_INTERVAL);
  }


  getItems() {
    var _self = this;
    var props = this.props;
    var selectedValues = props.selectedValues;
    return this.props.distinctValues.map(function(v) {
      return {
        selected : isValueSelected(v, selectedValues),
        value    : v,
        label    : v,
        key      : v
      }
    });
  }


  updateFilter() {
    var selectedFilterValues = Object.keys(this.selectedValuesMap);
    this.props.onFilterChange(this.props.columnName, selectedFilterValues);
  }


  @autobind
  handleFilterChange(value, isSelected) {
    if(isSelected)
      this.selectedValuesMap[value] = isSelected;
    else
      delete this.selectedValuesMap[value];
    this.updateFilter();
  }


  @autobind
  renderItems() {
    var _self = this;
    var options = this.getItems().map(function(item){
      return (
        <ColumnFilterOption value={item.value} key={item.key} label={item.label} updateFilterSelection={_self.handleFilterChange}/>
      );
    });
    return options;
  }


  render() {
    if (this.props.distinctValues.length)
      return (
        <Menu items={this.renderItems()} className='h-column-filter'>
          <span className='fa fa-filter'/>
        </Menu>
      );
    else
      return (<span/>);
  }
}

export default ColumnFilter;
