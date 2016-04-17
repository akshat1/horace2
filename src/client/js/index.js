'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
// See http://www.material-ui.com/#/get-started/installation
require('react-tap-event-plugin')();
const { Router, Route, hashHistory } = require('react-router');
const MuiThemeProvider = require('material-ui/lib/MuiThemeProvider');
const getMuiTheme = require('material-ui/lib/styles/getMuiTheme');
const {deepOrange500} = require('material-ui/lib/styles/colors');
const App = require('./component/app.jsx');
const About = require('./component/about.jsx');


const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
});

/*
function onDOMContentLoaded() {
  ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}>
      <Router history={hashHistory}>
        <Route path='/' component={App}/>
        <Route path='/about' component={About}/>
      </Router>
    </MuiThemeProvider>,
    document.getElementById('root')
  );
}
*/


const BookListQueries = {};

function onDOMContentLoaded() {
  ReactDOM.render(
    <MuiThemeProvider muiTheme={muiTheme}>
      <Router history={hashHistory}>
        <Route path='/' component={App}/>
        <Route path='/about' component={About}/>
      </Router>
    </MuiThemeProvider>,
    document.getElementById('root')
  );
}



document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
