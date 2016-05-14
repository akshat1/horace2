'use strict';

/* eslint-disable no-unused-vars */
const React = require('react');
const ReactDOM = require('react-dom');
const Library = require('./component/library.jsx');
const {default: getMuiTheme} = require('material-ui/styles/getMuiTheme');
const {default: MuiThemeProvider} = require('material-ui/styles/MuiThemeProvider');


function onDomLoadedWithMUI() {
  ReactDOM.render(
    (
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Library />
    </MuiThemeProvider>
    ),
    document.getElementById('libraryRoot')
  );
}


function onDomLoaded() {
  ReactDOM.render(
    (
    <Library />
    ),
    document.getElementById('libraryRoot')
  );
}

document.addEventListener('DOMContentLoaded', onDomLoaded);
