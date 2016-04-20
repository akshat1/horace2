'use strict';

const React    = require('react');
const AppBar   = require('material-ui/lib/app-bar');
const BookList = require('./book-list.jsx');


class App extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    return (
      <div id='hAppRoot'>
        <AppBar
          className='h-app-bar'
          title='Library'
        />
        <BookList />
      </div>
    );
  }
}


module.exports = App;
