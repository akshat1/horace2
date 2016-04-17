'use strict';

const React = require('react');
const Relay = require('react-relay');

class App extends React.Component {
  render() {
    return (<h1>Hello</h1>);
  }
}


/*
module.exports = Relay.createContainer(App, {
  fragments: {
    bookList: () => Relay.QL`
      fragment on BookList {
        title
      }
    `
  }
});
*/

module.exports = App;