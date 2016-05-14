'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const {Client: ClientEvents, Server: ServerEvents} = require('./../../../app/events.js');
const {ToolbarGroupFloat, Toolbar, ToolbarGroup, ToolbarSeparator} = require('../widget/Toolbar.jsx');
const {TextField} = require('../widget/TextInput.jsx');
const {Button, ButtonType} = require('../widget/Button.jsx');

const StyleClass = {
  ROOT      : 'h-toolbar',
  TGSECONDARY : 'h-toolbar-group-seconday',
  TGPRIMARY   : 'h-toolbar-group-primary',
  TGSEARCH    : 'h-toolbar-group-search'
};


class HToolbar extends React.Component {
  constructor(props) {
    super(props);
  }


  renderIndicators() {
    return [
      <Button faIconName = 'bell' type = {ButtonType.Indicator}/>,
      <ToolbarSeparator/>
    ];
  }


  renderBookGroupControls() {
    let isNothingSelected = this.props.selectedBooks.length === 0;
    let isMultipleBookControlsDisabled = this.props.selectedBooks.length < 2;

    return (
      <ToolbarGroup className = {StyleClass.TGSECONDARY}>
        {this.renderIndicators()}
        <Button label = 'Hide'  disabled = {isNothingSelected} faIconName = 'eye-slash'/>
        <Button label = 'Edit'  disabled = {isNothingSelected} faIconName = 'edit'/>
        <Button label = 'Group' disabled = {isMultipleBookControlsDisabled} faIconName = 'object-group'/>
        <ToolbarSeparator/>
      </ToolbarGroup>
    );
  }


  renderBookControls() {
    let isSingleBookControlsDisabled = this.props.selectedBooks.length !== 1;
    return (
      <ToolbarGroup className = {StyleClass.TGPRIMARY}>
        <Button label = 'Download' primary = {true} disabled={isSingleBookControlsDisabled} faIconName = 'download'/>
      </ToolbarGroup>
    );
  }


  renderSearchControls() {
    return (
      <ToolbarGroup className = {StyleClass.TGSEARCH}>
        <TextField hintText = 'Search'/>
      </ToolbarGroup>
    );
  }


  render() {
    return (
      <div className = {StyleClass.ROOT}>
        <Toolbar>
          <ToolbarGroup float = {ToolbarGroupFloat.LEFT}>
            {this.renderBookGroupControls()}
            {this.renderBookControls()}
          </ToolbarGroup>
          {this.renderSearchControls()}
        </Toolbar>
      </div>
    )
  }
}


module.exports = HToolbar;