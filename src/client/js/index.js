'use strict';

/* eslint-disable no-unused-vars */
const React = require('react');
const ReactDOM = require('react-dom');
const {Growl, GrowlType} = require('./component/growl.jsx');
const {Client: ClientEvents, Server: ServerEvents} = require('./../../app/events.js');
const PubSub = require('./util/pubsub.js');
const Library = require('./component/library.jsx');


function globalErrorHandler(message, source, line, col, error) {
  console.error('globalErrorHandler caught an error > %O', arguments);
  console.error(error.stack);
  PubSub.broadcast(ClientEvents.GROWL, {
    type: GrowlType.ERROR,
    message: `${source}:${line}:${col} - ${message}`
  });
}


function onDomLoaded() {
  window.onerror = globalErrorHandler;

  ReactDOM.render(
    (
    <Library />
    ),
    document.getElementById('libraryRoot')
  );
}

document.addEventListener('DOMContentLoaded', onDomLoaded);
