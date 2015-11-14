'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import Menu from './menu.jsx';
import _ from 'lodash';
import PubSub from './../util/pubsub.js';
import HoraceEvents from './../../../app/events.js';
const ClientEvents = HoraceEvents.Client;


const FILTER_DEBOUNCE_INTERVAL = 750;


function isValueSelected(value, selectedValues) {
  return selectedValues && selectedValues.indexOf(value) >= 0;
}


class ColumnFilterOption extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
  }


  @autobind
  handleChange(e) {
    var value = this.props.value;
    var selected = this.refs['checkbox'].getDOMNode().checked;
    this.setState({
      selected: selected
    });
    this.props.updateFilterSelection(value, selected);
  }


  componentWillUpdate(nextProps, nextState) {
    if (nextProps.selected != this.state.selected) {
      this.setState({
        selected: nextProps.selected
      });
    }
  }


  renderInputElement() {
    if (this.state.selected)
      return <input type='checkbox' onChange={this.handleChange} ref='checkbox' checked/>
    else
      return <input type='checkbox' onChange={this.handleChange} ref='checkbox'/>
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


class ColumnFilter extends Menu {
  constructor(props) {
    super();
    this.key = _.uniqueId('columnFilter_');
    this.selectedValuesMap = {};
    this.updateFilter = _.debounce(this.updateFilter, FILTER_DEBOUNCE_INTERVAL);
    this.state = {
      distinctValues: []
    };
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


  getItems() {
    var _self = this;
    var props = this.props;
    var state = this.state;
    var selectedValues = props.selectedValues;
    return state.distinctValues.map(function(v) {
      let isSelected = isValueSelected(v, selectedValues);
      return (
        <ColumnFilterOption value={v} key={v} label={v} selected={isSelected} updateFilterSelection={_self.handleFilterChange}/>
      );
    });
  }


  getBroadcastPayload() {
    return {
      key       : this.getKey(),
      trigger   : this.refs['trigger'].getDOMNode(),
      items     : this.getItems(),
      className : this.props.className
    };
  }


  getChildren() {
    return (<span className='fa fa-filter'/>);
  }


  fetchSelectedItems() {
    return Net.getDistinctBookAttribute(this.props.columnName)
      .then(function(values){
        this.setState({
          distinctValues: values
        });
      }.bind(this));
  }


  @autobind
  handleClick(e) {
    if(this.props.disabled)
      return;
    this.fetchSelectedItems().then(function() {
      PubSub.broadcast('menu.clicked', this.getBroadcastPayload());
    }.bind(this));
  }
}
/*
class ColumnFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.selectedValuesMap = {};
    this.updateFilter = _.debounce(this.updateFilter, FILTER_DEBOUNCE_INTERVAL);
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


  @autobind
  renderItems() {
    var _self = this;
    var props = this.props;
    var selectedValues = props.selectedValues;
    return this.props.distinctValues.map(function(v) {
      let isSelected = isValueSelected(v, selectedValues);
      return (
        <ColumnFilterOption value={v} key={v} label={v} selected={isSelected} updateFilterSelection={_self.handleFilterChange}/>
      );
    });
  }


  render() {
    if (this.props.distinctValues.length)
      return (
        <Menu items={this.renderItems} className='h-column-filter'>
          <span className='fa fa-filter'/>
        </Menu>
      );
    else
      return (<span/>);
  }
}
*/

export default ColumnFilter;
