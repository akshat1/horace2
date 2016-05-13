'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const {Client: ClientEvents, Server: ServerEvents} = require('./../../../app/events.js');

const {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle
} = require('material-ui/Toolbar');

const TGroupFloat = {
  LEFT: 'left',
  RIGHT: 'right'
};

const {default: TextField} = require('material-ui/TextField');
const {default: RaisedButton} = require('material-ui/RaisedButton');


const StyleClass = {
  ROOT : 'h-toolbar'
};


class HToolbar extends React.Component {
  constructor(props) {
    super(props);
  }


  renderBookGroupControls() {
    let isNothingSelected = this.props.selectedBooks.length === 0;
    let isMultipleBookControlsDisabled = this.props.selectedBooks.length < 2;

    return (
      <ToolbarGroup>
        <RaisedButton label = 'Hide' disabled={isNothingSelected}/>
        <RaisedButton label = 'Edit' disabled={isNothingSelected}/>
        <RaisedButton label = 'Group' disabled={isMultipleBookControlsDisabled}/>
      </ToolbarGroup>
    );
  }


  renderBookControls() {
    let isSingleBookControlsDisabled = this.props.selectedBooks.length !== 1;
    return (
      <ToolbarGroup>
        <RaisedButton label = 'Download' primary = {true} disabled={isSingleBookControlsDisabled}/>
      </ToolbarGroup>
    );
  }


  renderSearchControls() {
    return (
      <ToolbarGroup>
        <TextField hintText = 'Search'/>
      </ToolbarGroup>
    );
  }


  render() {
    return (
      <div className = {StyleClass.ROOT}>
        <Toolbar>
          <ToolbarGroup float = {TGroupFloat.LEFT}>
            {this.renderBookGroupControls()}
            <ToolbarSeparator/>
            {this.renderBookControls()}
          </ToolbarGroup>
          {this.renderSearchControls()}
        </Toolbar>
      </div>
    )
  }
}


module.exports = HToolbar;