'use strict';
const React = require('react');
const autobind = require('autobind-decorator');
const PubSub = require('./../util/pubsub.js');
const {Client: ClientEvents, Server: ServerEvents} = require('./../../../app/events.js');
const {Button, ButtonType} = require('../widget/Button.jsx');


class Notifications extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let isDisabled = !this.props.notifications.length;
    return (
      <Button faIconName = 'bell' type = {ButtonType.Indicator} disabled = {isDisabled}/>
    );
  }
}


module.exports = Notifications;
