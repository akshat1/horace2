'use strict';

const React = require('react');
const {WidgetStyleClass} = require('./WidgetBase.js');


const StyleClass = {
  Button: 'h-widget-button',
  Primary: 'h-button-primary',
  Indicator: 'h-button-indicator',
  Close: 'h-button-close',
  Size: {
    Small: 'h-widget-button-small',
    Medium: 'h-widget-button-medium',
    Large: 'h-widget-button-large'
  }
};


const ButtonType = {
  Normal    : 0,
  Indicator : 1,
  Close     : 2
};


const ButtonSize = {
  Small: 'Small',
  Medium: 'Medium',
  Large: 'Large'
};
ButtonSize.Default = ButtonSize.Medium;


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
    let {
      type: buttonType = ButtonType.Normal,
      size: buttonSize = ButtonSize.Default,
      disabled,
      label,
      onClick = _.noop,
      faIconName,
      className,
      primary
    } = props;
    if (buttonType === ButtonType.Indicator)
      classNames.push(StyleClass.Indicator);

    else if (buttonType === ButtonType.Close) {
      faIconName = 'close';
      buttonSize = ButtonSize.Small;
      classNames.push(StyleClass.Close);
    }

    if (className)
      classNames.push(className);

    if (primary)
      classNames.push(StyleClass.Primary);

    classNames.push(StyleClass.Size[buttonSize]);

    if (faIconName) {
      icon = <div className = {`fa fa-${faIconName.toLowerCase()}`}/>
    }

    return (
      <button
        className = {`${classNames.join(' ')}`}
        disabled  = {disabled}
        onClick   = {onClick}
        >
        {icon}
        {label}
      </button>
    );
  }
}


module.exports = {
  Button,
  ButtonType,
  ButtonSize
};