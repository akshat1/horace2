'use strict';

var React = require('react');


class ViewSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div className='h-view-selector'>
        <a href='#' className='h-view-link'>Books</a>
        <a href='#' className='h-view-link h-disabled'>Authors</a>
        <a href='#' className='h-view-link h-disabled'>Years</a>
        <div className='h-logo'>Horace</div>
      </div>
    );
  }
}

module.exports = ViewSelector;