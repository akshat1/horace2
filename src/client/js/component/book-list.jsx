'use strict';
var React = require('react');
var HTable = require('./h-table.jsx');
var autobind = require('autobind-decorator');
var PubSub = require('./../util/pubsub.js');
var ClientEvents = require('./../../../app/events.js').Client;
var _ = require('lodash');


class BookList extends React.Component {
  constructor(props) {
    super(props);
    window._BookList = this;
    this.handleWrapperScroll = _.debounce(this.handleWrapperScroll, 150);
    this.columnMetadata = [
      {
        columnName     : 'adapterId',
        cssClassName   : 'h-adapterId',
        displayName    : 'Adapter',
        isSortable     : true,
        isFiltered     : true
      }, {
        columnName   : 'title',
        cssClassName : 'h-title',
        displayName  : 'Title',
        isSortable   : true,
        rowComponent : this.renderCustomTitleRowComponent
        //isFiltered   : true
      }, {
        columnName     : 'authors',
        cssClassName   : 'h-authors',
        displayName    : 'Author',
        isSortable     : true,
        sortColumnName : 'sortStringAuthors',
        isFiltered     : true
      }, {
        columnName     : 'subjects',
        cssClassName   : 'h-subjects',
        displayName    : 'Subjects',
        isSortable     : true,
        sortColumnName : 'sortStringSubjects',
        isFiltered     : true
      }, {
        columnName     : 'displayYear',
        cssClassName   : 'h-year',
        displayName    : 'Year',
        isSortable     : true,
        sortColumnName : 'year',
        isFiltered     : true
      }
    ];
    this.state = {
      fillerStyle: {}
    };
  }//constructor


  askForMoreBooks() {
    PubSub.broadcast(ClientEvents.LOAD_MORE_BOOKS, {});
  }


  @autobind
  isBookSelected(book) {
    return !!this.props.selectedBooks.find(function(b){
      return b.id === book.id;
    });
  }


  @autobind
  handleWrapperScroll() {
    var wrapper = this.refs['wrapper'];
    if(!wrapper)
      throw new Error('There aint no wrappa!');
    var delta = wrapper.scrollHeight - wrapper.scrollTop - wrapper.offsetHeight;
    if(delta < 300)
      this.askForMoreBooks();
    this.setState({
      fillerStyle: {
        paddingTop: wrapper.scrollTop
      }
    });
  }


  @autobind
  renderCustomTitleRowComponent(book) {
    return (
      <span className='h-title-content'>
        {book.title}
      </span>
    );
  }


  renderBooks() {
    let props = this.props;
    //this is where we figure out which books to show
    var wrapper = this.refs.wrapper;
    var books = props.books;
    if (wrapper) {
      var scrollHeight = wrapper.querySelector('table').scrollHeight;
      var totalNumberOfRows = wrapper.querySelectorAll('tr').length;
      var averageRowHeight = scrollHeight / totalNumberOfRows;
      var numberOfRowsToRemove = Math.ceil(wrapper.scrollTop / averageRowHeight);
      numberOfRowsToRemove = numberOfRowsToRemove;
      books = books.slice(numberOfRowsToRemove);
    }

    return (
      <div className='h-table-wrapper' ref='wrapper' onScroll={this.handleWrapperScroll}>
        <div style={this.state.fillerStyle}>
        </div>
        <HTable
          canSelect              = {true}
          isSelected             = {this.isBookSelected}
          pubSubKey              = 'bookTable'
          rows                   = {books}
          sortColumnName         = {props.sortColumn}
          sortAscending          = {props.sortAscending}
          columns                = {props.displayColumns}
          columnMetadata         = {this.columnMetadata}
          selectedDistinctValues = {props.filter}
        />
      </div>
    );
  }


  renderBlockingWaitComponent() {
    var className = `h-blocking-ui-wait ${this.props.isPerformingBlockingAction ? 'visible' : ''}`;
    return (
      <div className={className}>
        <span className='fa fa-refresh fa-spin'/>
        <span className='label'>Updating&hellip;</span>
      </div>
    );
  }


  render() {
    return (
      <div className='h-book-list'>
        {this.renderBooks()}
        {this.renderBlockingWaitComponent()}
      </div>
    );
  }
}

module.exports = BookList;
