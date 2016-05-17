'use strict';
const React       = require('react');
const autobind    = require('autobind-decorator');
const PubSub      = require('./../util/pubsub.js');
const {TextField} = require('../widget/TextInput.jsx');
const {WidgetStyleClass} = require('../widget/WidgetBase.js');
const {Client: ClientEvents} = require('../../../app/events.js');
const {
  Button,
  ButtonSize,
  ButtonType
} = require('../widget/Button.jsx');


const RefName = {
  ROOT: 'ROOT'
};


const StyleClass = {
  ROOT: 'h-search-box',
  TEXTFIELD: 'h-search-box-text-input',
  GOBUTTON: 'h-search-go-button',
  Indicator: 'h-search-indicator'
};


class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || ''
    };
  }


  @autobind
  _handleChange(evt) {
    this.setState({
      value: evt.target.value
    });
  }


  @autobind
  _handleGo() {
    PubSub.broadcast(ClientEvents.SEARCH_CHANGED, this.state.value);
  }


  renderButton() {
    return (
      <Button
        label      = 'Go'
        faIconName = 'search'
        buttonSize = {ButtonSize.Small}
        disabled   = {this.props.isBusy}
        className  = {StyleClass.GOBUTTON}
        onClick    = {this._handleGo}
        />
    );
  }


  componentWillReceiveProps({value}) {
    if (value !== this.state.value)
      this.setState({
        value: value
      });
  }


  render() {
    return (
      <div className = {`${WidgetStyleClass.Widget} ${StyleClass.ROOT}`} ref = {RefName.ROOT} tabIndex = {-1}>
        <TextField
          placeholder = 'Search'
          value       = {this.state.value}
          onChange    = {this._handleChange}
          disabled    = {this.props.isBusy}
          className   = {StyleClass.TEXTFIELD}
          />
        {this.renderButton()}
      </div>
    );
  }
}


module.exports = SearchBox;
