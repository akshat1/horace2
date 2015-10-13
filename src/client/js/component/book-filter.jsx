'use strict';
import React from 'react';
import autobind from 'autobind-decorator';

class BookFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: {
        selectedAdapterTypes : [],
        selectedAuthors      : [],
        selectedSubjects     : [],
        selectedYears        : []
      }
    };
  }


  render() {
    return (
      <div className="h-book">
        <table>
          <caption>Filter the books</caption>
          <tbody>
            <tr>
              <td>Adapter Type</td><td>Beh</td>
            </tr>
            <tr>
              <td>Author</td><td>Beh</td>
            </tr>
            <tr>
              <td>Subject</td><td>Beh</td>
            </tr>
            <tr>
              <td>Year</td><td>Beh</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default BookFilter;