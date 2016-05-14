'use strict';

const React = require('react');
const {WidgetStyleClass} = require('./WidgetBase.js');


const StyleClass = {
  Button: 'h-widget-button',
  Primary: 'h-button-primary',
  Indicator: 'h-button-indicator'
};


const ButtonType = {
  Normal    : 0,
  Indicator : 1
};


class Button extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let props = this.props;
    let classNames = [
      WidgetStyleClass.Widget,
      StyleClass.Button
    ];
    let icon = null;
    let buttonType = props.type || ButtonType.Normal;
    if (buttonType === ButtonType.Indicator)
      classNames.push(StyleClass.Indicator);

    if (props.className)
      classNames.push(props.className);

    if (props.primary)
      classNames.push(StyleClass.Primary);

    if (props.faIconName) {
      icon = <div className = {`fa fa-${props.faIconName}`}/>
    }

    return (
      <button
        className = {`${classNames.join(' ')}`}
        disabled = {props.disabled}
        >
        {icon}
        {props.label}
      </button>
    );
  }
}


module.exports = {
  Button: Button,
  ButtonType: ButtonType
};