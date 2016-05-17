'use strict';
const React = require('react');
const {WidgetStyleClass} = require('./WidgetBase.js');
const _ = require('lodash');


const StyleClass = {
  TextField: 'h-widget-textfield'
};


class TextField extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let {
      disabled,
      className: incomingStyleClassName = '',
      placeholder = '',
      value = '',
      onChange = _.noop,
      onFocus = _.noop,
      onBlur = _.noop
    } = this.props;

    return (
      <input
        type        = 'text'
        className   = {`${WidgetStyleClass.Widget} ${StyleClass.TextField} ${incomingStyleClassName}`}
        placeholder = {placeholder}
        value       = {value}
        onChange    = {onChange}
        onFocus     = {onFocus}
        onBlur      = {onBlur}
        disabled    = {disabled}
        />
    );
  }
}


module.exports = {
  TextField: TextField
};
