'use strict';
const React       = require('react');
const autobind    = require('autobind-decorator');
const PubSub      = require('./../util/pubsub.js');
const _ = require('lodash');
const {TextField} = require('../widget/TextInput.jsx');
const {WidgetStyleClass} = require('../widget/WidgetBase.js');
const {Client: ClientEvents} = require('../../../app/events.js');
const {
  Button,
  ButtonSize,
  ButtonType
} = require('simian-react-button');


const RefName = {
  ROOT: 'ROOT',
  TEXTFIELD: 'TEXTFIELD'
};


const StyleClass = {
  ROOT: 'h-search-box',
  TEXTFIELD: 'h-search-box-text-input h-text-input-low-profile',
  GOBUTTON: 'h-search-go-button',
  Indicator: 'h-search-indicator'
};


class SearchBox extends React.Component {
  static SearchDebounceInterval = 500;

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || ''
    };
    this.performSearch = _.debounce(this.performSearch, SearchBox.SearchDebounceInterval);
  }


  @autobind
  _handleChange(evt) {
    this.setState({
      value: evt.target.value
    });
    this.performSearch();
  }


  @autobind
  performSearch() {
    PubSub.broadcast(ClientEvents.SEARCH_CHANGED, this.state.value);
  }


  @autobind
  expand() {
    this.refs[RefName.TEXTFIELD].focus();
  }


  @autobind
  clearSearchBox() {
    this.setState({
      value: ''
    });
    this.performSearch();
  }


  renderButton() {
    return (
      <Button
        label      = 'Go'
        faIconName = 'search'
        buttonSize = {ButtonSize.SMALL}
        disabled   = {this.props.isBusy}
        className  = {StyleClass.GOBUTTON}
        onClick    = {this.performSearch}
        />
    );
  }


  renderIcon() {
    if (this.state.value && this.state.value.trim()) {
      return (
        <Button
          label = ''
          faIconName = 'times-circle-o'
          type = {ButtonType.INDICATOR}
          onClick = {this.clearSearchBox}
          />
      );

    } else {
      return (
        <Button
          label = ''
          faIconName = 'search'
          type = {ButtonType.INDICATOR}
          onClick = {this.expand}
          />
      );
    }
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
          ref         = {RefName.TEXTFIELD}
          />
        {this.renderIcon()}
      </div>
    );
  }
}


module.exports = SearchBox;
