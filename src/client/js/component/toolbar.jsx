'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const {Client: ClientEvents, Server: ServerEvents} = require('./../../../app/events.js');
const Notifications = require('./notifications.jsx');
const {ToolbarGroupFloat, Toolbar, ToolbarGroup, ToolbarSeparator} = require('../widget/Toolbar.jsx');
const SearchBox = require('./searchbox.jsx');
const {Button} = require('../widget/Button.jsx');

const StyleClass = {
  ROOT        : 'h-toolbar',
  TGSECONDARY : 'h-toolbar-group-seconday',
  TGPRIMARY   : 'h-toolbar-group-primary',
  TGSEARCH    : 'h-toolbar-group-search'
};


class HToolbar extends React.Component {
  constructor(props) {
    super(props);
  }


  doHide() {
    console.log('Hide');
  }


  doEdit() {
    console.log('Edit');
  }


  doGroup() {
    console.log('Group');
  }


  doDownload() {
    console.log('Download');
  }


  renderIndicators() {
    return [
      <Notifications notifications = {this.props.notifications} key = 'h.toolbar.indicator.notifications'/>
    ];
  }


  renderBookGroupControls() {
    let isNothingSelected = this.props.selectedBooks.length === 0;
    let isMultipleBookControlsDisabled = this.props.selectedBooks.length < 2;

    return (
      <ToolbarGroup className = {StyleClass.TGSECONDARY}>
        {this.renderIndicators()}
        <Button
          label      = 'Hide'
          disabled   = {isNothingSelected}
          faIconName = 'eye-slash'
          onClick    = {this.doHide}
          />
        <Button
          label      = 'Edit'
          disabled   = {isNothingSelected}
          faIconName = 'edit'
          onClick    = {this.doEdit}
          />
        <Button
          label      = 'Group'
          disabled   = {isMultipleBookControlsDisabled}
          faIconName = 'object-group'
          onClick    = {this.doGroup}
          />
        <ToolbarSeparator/>
      </ToolbarGroup>
    );
  }


  renderBookControls() {
    let isSingleBookControlsDisabled = this.props.selectedBooks.length !== 1;
    return (
      <ToolbarGroup className = {StyleClass.TGPRIMARY}>
        <Button
          label      = 'Download'
          primary    = {true}
          disabled   = {isSingleBookControlsDisabled}
          faIconName = 'download'
          onClick    = {this.doDownload}
          />
      </ToolbarGroup>
    );
  }


  renderSearchControls() {
    return (
      <ToolbarGroup className = {StyleClass.TGSEARCH}>
        <SearchBox value = {this.props.searchString}/>
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