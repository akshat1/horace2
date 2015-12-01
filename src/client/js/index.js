'use strict';

/* eslint-disable no-unused-vars */
/* istanbul ignore next having to ignore imports is getting old */
var React = require('react');
/* istanbul ignore next having to ignore imports is getting old */
var ReactDOM = require('react-dom');
/* istanbul ignore next having to ignore imports is getting old */
var Library = require('./component/library.jsx');

document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(
    <Library />,
    document.getElementById('libraryRoot')
  );
});
