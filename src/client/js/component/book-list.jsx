'use strict';

const React        = require('react');
const SGrid        = require('simian-grid');
//const Checkbox   = require('material-ui/lib/checkbox');
//const IconMenu     = require('material-ui/lib/menus/icon-menu');
//const MenuItem     = require('material-ui/lib/menus/menu-item');
//const IconButton   = require('material-ui/lib/icon-button');
//const MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert');
const autobind     = require('autobind-decorator');
const Net          = require('../util/net.js');


const columnDefinition = [{
  title: <input type='checkbox' />,
  className: 'h-book-list-select'
}, {
  title: 'Title',
  className: 'h-book-list-book-title'
}, {
  title: 'Authors',
  className: 'h-book-list-book-authors'
}];


const CheckboxStyle = {
  width: 20
}


function bookToRow(book) {
  return [
    <input type='checkbox' />,
    <BookTitleComponent title={book.title}/>,
    book.authors.join(', ')
  ];
}


const BookTitleComponent = (props) =>
  <div className='h-book-list-book-title-wrapper'>
    {props.title}
  </div>


const BookSelectionComponent = (props) =>
  <Checkbox
  />


class BookList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      numTotalBooks: 0
    }
  }


  @autobind
  handleBooksReceived(res) {
    let out = res.books.map(bookToRow);
    return out;
  }


  @autobind
  getBooks(beginIndex, numItems) {
    return Net.getBooks(beginIndex, numItems).then(this.handleBooksReceived);
  }


  componentWillMount() {
    Net.getBooks(0, 0).then(function(res) {
      this.setState({
        numTotalBooks: res.numTotalBooks
      });
    }.bind(this));
  }


  @autobind
  render() {
    let state = this.state;
    return (
      <div className='h-book-list-root' ref='book-list-root'>
        <div className='h-book-list-grid-container'>
          <SGrid
            columnDefinition={columnDefinition}
            rowHeight={40}
            pageSize={500}
            numTotalRows={state.numTotalBooks}
            numBufferRows={30}
            getRowsFunction={this.getBooks}
          />
        </div>
      </div>
    );
  }
}


module.exports = BookList;
