'use strict';
const React = require('react');
const {WidgetStyleClass} = require('./WidgetBase.js');
const _ = require('lodash');


const RefName = {
  INPUT: 'INPUT'
};


const StyleClass = {
  TextField: 'h-widget-textfield'
};


const TextFieldType = {
  TEXT   : 'text',
  NUMBER : 'number'
};


class TextField extends React.Component {
  constructor(props) {
    super(props);
  }


  focus() {
    this.refs[RefName.INPUT].focus();
  }


  getValue() {
    this.refs[RefName.INPUT].value;
  }


  render() {
    let {
      disabled,
      className: incomingStyleClassName = '',
      placeholder = '',
      value = '',
      onChange = _.noop,
      onFocus = _.noop,
      onBlur = _.noop,
      type = 'text'
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
        ref         = {RefName.INPUT}
        type        = {type}
        />
    );
  }
}


module.exports = {
  TextField: TextField,
  TextFieldType: TextFieldType
};
