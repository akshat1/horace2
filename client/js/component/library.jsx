'use strict';

import EventEmitter from 'events';
import React from 'react';
import autobind from 'autobind-decorator'
import Net from '../util/net.js';
import BookList from './book-list.jsx';
import ViewSelector from './view-selector.jsx';


class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;
  }//constructor

  render() {
    return (
      <div className='library'>
        <ViewSelector/>
        <BookList/>
      </div>
    );
  }//render
}//Library

export default Library;