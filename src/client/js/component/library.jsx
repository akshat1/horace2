'use strict';

import EventEmitter from 'events';
import React from 'react';
import BookList from './book-list.jsx';


class Library extends React.Component {
  constructor(props) {
    super(props);
    window._Library = this;
  }//constructor

  render() {
    return (
      <div className='h-library'>
        <div className='h-tool-bar'>
          <div className='h-logo'>
            Horace
          </div>
        </div>
        <BookList/>
      </div>
    );
  }//render
}//Library

export default Library;