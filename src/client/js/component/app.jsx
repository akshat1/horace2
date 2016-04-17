'use strict';

const React = require('react');
const Relay = require('react-relay');

class App extends React.Component {
  static propTypes = {
    bookList: React.PropTypes.object.isRequired
  };


  constructor(props) {
    super(props);
  }


  render() {
    return (<h1>Hello</h1>);
  }
}


module.exports = App;


/*module.exports = Relay.createContainer(App, {
  fragments: {
    bookList: () => Relay.QL`
      fragment on BookList(from: 10, numItems: 3) {
        title
      }
    `
  }
});*/
