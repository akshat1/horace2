'use strict';
const React = require('react');
const {WidgetStyleClass} = require('./WidgetBase.js');


const StyleClass = {
  TextField: 'h-widget-textfield'
};


const TextField = (props) =>
  <input
    type = 'text'
    className = {`${WidgetStyleClass.Widget} ${StyleClass.TextField}`}
    placeholder = {props.hintText || ''}
    />


module.exports = {
  TextField: TextField
};
