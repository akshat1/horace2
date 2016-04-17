'use strict';

const React = require('react');

class About extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id='hAbout'>
        <h1>Horace</h1>
        <h3>The Librarian</h3>
        <p>
          Read your e-books; On the desktop, or on the phone.
        </p>
      </div>
    );
  }
}


module.exports = About;
