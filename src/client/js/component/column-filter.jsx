'use strict';

import React from 'react';
import autobind from 'autobind-decorator';
import Menu from './menu.jsx';


class FilterOption extends React.Component {
  constructor(props){
    super(props);
    this.state = {}
  }


  render() {
    return (
      <label key={this.props.label}>
        <input type='checkbox' checked={this.props.selected}/>
        {this.props.label}
      </label>
    );
  }
}


class ColumnFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: []
    }
  }


  fetchOptions() {
    var selectedValues = this.props.selectedOptions;
    var _self = this;
    console.debug('ColumnFilter.fetchOptions');
    this.props.getOptions()
    .then(function(values) {
      var options = values.map(function(v) {
        var isSelected = selectedValues.find(
          function(sV) {
            return sV === v;
          });//find
        return (<FilterOption selected={isSelected} label={v}/>);
      });//.map
      _self.setState({
        options: options
      });//setState
    })//then
  }


  componentDidMount() {
    this.fetchOptions();
  }


  render() {
    return (
      <Menu items={this.state.options} className='h-column-filter' disabled={this.state.options.length < 1}>
        <span className='fa fa-filter'/>
      </Menu>
    );
  }
}

export default ColumnFilter;
