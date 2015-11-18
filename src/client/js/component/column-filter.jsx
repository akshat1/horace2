'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import Popup from './popup.jsx';
import _ from 'lodash';
import PubSub from './../util/pubsub.js';
import * as Net from './../util/net.js';
import HoraceEvents from './../../../app/events.js';
const ClientEvents = HoraceEvents.Client;


const FILTER_DEBOUNCE_INTERVAL = 750;


function isValueSelected(value, selectedValuesMap) {
  return selectedValuesMap[value];
}


class ColumnFilterOption extends React.Component {
  constructor(props) {
    super(props);
  }


  @autobind
  handleChange() {
    var value = this.props.value;
    var selected = this.refs['checkbox'].checked;
    this.setState({
      selected: selected
    });
    this.props.onChange(value, selected);
  }


  renderInputElement() {
    if (this.props.selected)
      return <input type='checkbox' onChange={this.handleChange} ref='checkbox' checked/>;
    else
      return <input type='checkbox' onChange={this.handleChange} ref='checkbox'/>;
  }


  render() {
    return (
      <label key={this.props.key}>
        {this.renderInputElement()}
        {this.props.label}
      </label>
    );
  }
}


class ColumnFilter extends React.Component {
  constructor(props) {
    super(props);
    this.selectedValuesMap = {};
    this.updateFilter = _.debounce(this.updateFilter, FILTER_DEBOUNCE_INTERVAL);
    this.state = {
      distinctValues: [],
      filteredValues: []
    };
  }


  setDistinctValues(values) {
    if (!values)
      throw new Error('no values');
    var filterBox = this.refs['filterOptions'];
    if (filterBox)
      filterBox.value = '';

    this.setState({
      distinctValues: values,
      filteredValues: values
    });
  }


  fetchDistinctValues() {
    Net.getDistinctBookAttribute(this.props.columnName)
    .then(function(values) {
      this.setDistinctValues(values);
    }.bind(this));
  }


  componentWillMount() {
    this.fetchDistinctValues();
  }


  @autobind
  filterOptions(e) {
    var pattern = e.target.value;
    var filtered;
    if(!pattern.length)
      filtered = this.state.distinctValues;
    else
      filtered = this.state.distinctValues.filter(function(v) {
        return v.toLowerCase().indexOf(pattern.toLowerCase()) > -1;
      });
    this.setState({
      filteredValues: filtered
    });
  }


  updateFilter() {
    var selectedFilterValues = Object.keys(this.selectedValuesMap);
    var eventPayload = {};
    eventPayload[this.props.columnName] = selectedFilterValues;
    PubSub.broadcast(ClientEvents.BOOKS_SET_FILTER, eventPayload);
  }


  @autobind
  handleFilterChange(value, isSelected) {
    if(isSelected)
      this.selectedValuesMap[value] = isSelected;
    else
      delete this.selectedValuesMap[value];
    this.updateFilter();
  }


  renderOptions() {
    var state = this.state;
    var selectedValuesMap = this.selectedValuesMap;
    var filteredValues = state.filteredValues;
    if(!filteredValues)
      throw new Error('No filtered values');
    return filteredValues.map(function(v) {
      return (<ColumnFilterOption key={v} label={v} value={v} selected={isValueSelected(v, selectedValuesMap)} onChange={this.handleFilterChange}/>);
    }.bind(this));
  }


  render() {
    return (<Popup className={this.props.className} title={`Filter ${this.props.columnName}`} dismiss={this.props.dismiss}>
        <div className='h-column-filter-root'>
          <div className='h-column-filter-filter'>
            <input type='text' placeholder='Start typing to filter options' onChange={this.filterOptions}/>
          </div>
          <div className='h-column-filter-options'>
            {this.renderOptions()}
          </div>
        </div>
      </Popup>);
  }
}

export default ColumnFilter;
