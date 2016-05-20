'use strict';
const React = require('react');
const {WidgetStyleClass} = require('./WidgetBase.js');


const StyleClass = {
  Toolbar          : 'h-widget-toolbar',
  ToolbarGroup     : 'h-widget-toolbar-group',
  ToolbarSeparator : 'h-widget-toolbar-separator'
};


const ToolbarGroupFloat = {
  LEFT: 'left',
  RIGHT: 'right'
};


const Toolbar = (props) =>
  <div className = {`${WidgetStyleClass.Widget} ${StyleClass.Toolbar} ${props.className || ''}`}>
    {props.children}
  </div>


class ToolbarGroup extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let floatStyleClass = this.props.float === ToolbarGroupFloat.RIGHT ? WidgetStyleClass.Right : WidgetStyleClass.Left;
    return (
      <div className = {`${WidgetStyleClass.Widget} ${floatStyleClass} ${StyleClass.ToolbarGroup} ${this.props.className || ''}`}>
        {this.props.children}
      </div>
    );
  }
}


const ToolbarSeparator = (props) =>
  <div className = {`${WidgetStyleClass.Widget} ${StyleClass.ToolbarSeparator} ${props.className || ''}`}/>


module.exports = {
  ToolbarGroupFloat : ToolbarGroupFloat,
  Toolbar           : Toolbar,
  ToolbarGroup      : ToolbarGroup,
  ToolbarSeparator  : ToolbarSeparator
};
