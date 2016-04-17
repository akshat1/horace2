'use strict';

/* eslint-disable no-unused-vars */
const React = require('react');
const ReactDOM = require('react-dom');
// See http://www.material-ui.com/#/get-started/installation
require('react-tap-event-plugin')();
const Library = require('./component/library.jsx');

document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(
    <Library />,
    document.getElementById('libraryRoot')
  );
});
