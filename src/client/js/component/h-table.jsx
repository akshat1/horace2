'use strict';
var React = require('react');
var autobind = require('autobind-decorator');
var _ = require('lodash');

var SortModel = require('./../../../app/model/library-model.js').SortModel;
var PubSub = require('./../util/pubsub.js');
var ClientEvents = require('./../../../app/events.js').Client;


/*
TODO: Use this
const StyleClass = {
  Ascending  : 'fa-sort-asc',
  Descending : 'fa-sort-desc',
  Sorted     : 'fa',
  Sortable   : 'h-sortable'
};
*/
class HTableRow extends React.Component {
  constructor(props) {
    super(props);
  }


  @autobind
  handleSelectionChange(evt) {
    PubSub.broadcast(ClientEvents.BOOK_SELECTION_CHANGED, {
      book       : this.props.data,
      isSelected : evt.currentTarget.checked
    });
  }


  @autobind
  renderSelectorBodyCell() {
    let checked = false;
    checked = this.props.isSelected(this.props.data);
    return (
      <td key={`selectorCell`} className='h-selector'>
        <input type='checkbox' checked={checked} onChange={this.handleSelectionChange}/>
      </td>
    );
  }


  @autobind
  getColumnMetadata(columnName) {
    if(this.props.columnMetadata)
      return this.props.columnMetadata.find(function(metadata){
        return metadata.columnName === columnName;
      });
  }


  @autobind
  renderCells() {
    let props = this.props;
    let rowContents = [];
    let columns = props.columns;
    let rowData = props.data;
    if (props.canSelect)
      rowContents.push(this.renderSelectorBodyCell());
    for (let i = 0, _len = columns.length; i < _len; i++) {
      let columnName = columns[i];
      let cellData = rowData[columnName];
      let metadata = this.getColumnMetadata(columnName);
      let className = metadata ? metadata.cssClassName : '';
      rowContents.push(
        <td key={`cell_${i}`} className={className}>{metadata.rowComponent? metadata.rowComponent(rowData) : cellData}</td>
      );
    }
    return (rowContents);
  }


  render() {
    return (<tr>
        {this.renderCells()}
      </tr>);
  }
}


/**
 * Props:
 *    rows: []
 *    changeSort: function(sortColumnName, isAscending) {}
 *    sortColumnName: String
 *    sortAscending: isAscending
 *    tableClassName: String
 *    columns: [String]
 *    getDistinct: function(<String>) {return [];}
 *    columnMetadata: [{     //optional, plus all properties of this are optional as well
 *      columnName     : String
 *      cssClassName   : String,
 *      displayName    : String,
 *      isSortable     : boolean,
 *      sortColumnName : String,
 *      rowComponent: function(data) { return ... } //Should return react component
 *    }]
 */
class HTable extends React.Component {
  constructor(props) {
    super(props);
    this.distinctValuesFetched = {};
    this.columnFilters = {};
    this.state = {
      distinctValues: {},
      selectedDistinctValues: {}
    };
  }


  @autobind
  makeColumnClickHandler(columnName, columnMetadata) {
    var sortColumnName = columnMetadata.sortColumnName || columnName;
    if(columnMetadata.isSortable)
      return function(){
        // if we clicked on the same column as the current sort column then simply flip the sort direction
        // otherwise the current column becomes the sort column and the direction becomes ascending.
        let isAscending = sortColumnName === this.props.sortColumnName ? !this.props.sortAscending : true;
        PubSub.broadcast(ClientEvents.TABLE_SET_SORT, {
          key       : this.props.pubSubKey,
          sortModel : new SortModel(sortColumnName, isAscending)
        });
      }.bind(this);
    else
      return _.noop;
  }


  @autobind
  getTableClassName() {
    return `h-list-table ${this.props.tableClassName || ''}`;
  }


  /**
   * Find the column metadata object for this column name
   * @param columnName {string} - The column name for which the metadata is to be found
   * @param {object} - The metadata object corresponding to this columnName. Undefined if nothing found.
   */
  @autobind
  getColumnMetadata(columnName) {
    if(this.props.columnMetadata)
      return this.props.columnMetadata.find(function(metadata){
        return metadata.columnName === columnName;
      });
  }


  /**
   * Get the markup for any sorting related icons
   */
  @autobind
  renderColumnSortComponent(columnName, columnMetadata) {
    var isSorted = (this.props.sortColumnName === columnName) || (this.props.sortColumnName === columnMetadata.sortColumnName);
    var isAscending = this.props.sortAscending;
    if(isSorted)
      return (
        <div className={`h-column-sort fa ${isAscending ? 'fa-sort-asc' : 'fa-sort-desc'}`}/>
      );
    else
      return <div className={'h-column-sort'}/>;
  }


  getSelectedDistinctValues(columnName) {
    return this.props.selectedDistinctValues[columnName] || [];
  }


  @autobind
  renderColumnFilterComponent(columnName, columnMetadata) {
    var isFiltered = columnMetadata.isFiltered;
    var showfilterPopup = function () {
      PubSub.broadcast(ClientEvents.BOOKS_SHOW_FILTER, columnName);
    };
    if (isFiltered) {
      return (<button onClick={showfilterPopup} className='h-column-filter-trigger fa fa-filter'></button>);
      //<ColumnFilter key={`CFilter_${columnName}`} columnName={columnName} selectedValues={this.getSelectedDistinctValues(columnName)} />;
    } else {
      return;
    }
  }


  /**
   * All the TH elements
   */
  @autobind
  renderTableHeadContent() {
    let headerContents = [];
    let props = this.props;
    let columns = props.columns;
    if (props.canSelect)
      headerContents.push(this.renderSelectorHeaderCell());
    for (let i = 0, _len = columns.length; i < _len; i++){
      let columnName = columns[i];
      let metadata = this.getColumnMetadata(columnName);
      if(metadata){
        headerContents.push(<th key={`header_cell_${i}`} className={metadata.cssClassName}>
          <div className='h-column-header-wrapper'>
            <div className={`h-column-name ${metadata.isSortable ? 'sortable' : ''}`} onClick={this.makeColumnClickHandler(columnName, metadata)}>
              {this.renderColumnSortComponent(columnName, metadata)}
              {metadata.displayName}
            </div>
            {this.renderColumnFilterComponent(columnName, metadata)}
          </div>
        </th>);
      } else {
        headerContents.push(<th key={`header_cell_${i}`} onClick={this.makeColumnClickHandler(columnName, metadata)}>{columnName}</th>);
      }
    }
    return (
      <tr>
        {headerContents}
      </tr>
    );
  }


  @autobind
  renderSelectorHeaderCell() {
    if (this.props.canSelect)
      return (<th key={'selectorCell'}>&nbsp;</th>);
  }


  /**
   * Get a list of TR elements.
   */
  @autobind
  renderTableBodyContent() {
    let props = this.props;
    let columns = props.columns;
    let columnMetadata = props.columnMetadata;
    let isSelected = props.isSelected || function() { return true;}
    return props.rows.map(function(rowData, rowIndex) {
      return (<HTableRow data={rowData} columns={columns} columnMetadata={columnMetadata} key={rowData.path} canSelect={props.canSelect} onSelect={props.onSelect} isSelected={isSelected}/>);
    });
  }


  /**
   * Get the markup for the entire table.
   */
  @autobind
  render() {
    return (
      <table className={this.getTableClassName()}>
        <thead>
          {this.renderTableHeadContent()}
        </thead>
        <tbody>
          {this.renderTableBodyContent()}
        </tbody>
      </table>
    );
  }
}

module.exports = HTable;
