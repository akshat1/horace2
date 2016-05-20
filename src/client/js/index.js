'use strict';

/* eslint-disable no-unused-vars */
const React = require('react');
const ReactDOM = require('react-dom');
const Library = require('./component/library.jsx');


function onDomLoaded() {
  ReactDOM.render(
    (
    <Library />
    ),
    document.getElementById('libraryRoot')
  );
}

document.addEventListener('DOMContentLoaded', onDomLoaded);
