'use strict';
import React from 'react';
import autobind from 'autobind-decorator';
import _ from 'lodash';

import ColumnFilter from './column-filter.jsx';


const StyleClass = {
  Ascending  : 'fa-sort-asc',
  Descending : 'fa-sort-desc',
  Sorted     : 'fa',
  Sortable   : 'h-sortable'
};


/**
 * Props:
 *    rows: []
 *    changeSort: function(sortColumnName, isAscending) {}
 *    setFilter: function(){}
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
  }


  @autobind
  componentDidMount() {}


  @autobind
  makeColumnClickHandler(columnName, columnMetadata) {
    var sortColumnName = columnMetadata.sortColumnName || columnName;
    if(columnMetadata.isSortable)
      return function(e){
        // if we clicked on the same column as the current sort column then simply flip the sort direction
        // otherwise the current column becomes the sort column and the direction becomes ascending.
        let isAscending = sortColumnName === this.props.sortColumnName ? !this.props.sortAscending : true;
        this.props.changeSort(sortColumnName, isAscending);
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
  getColumnSortComponent(columnName, columnMetadata) {
    var isSorted = (this.props.sortColumnName === columnName) || (this.props.sortColumnName === columnMetadata.sortColumnName);
    var isAscending = this.props.sortAscending;
    if(isSorted)
      return (
        <div className={`h-column-sort fa ${isAscending ? 'fa-sort-asc' : 'fa-sort-desc'}`}/>
      );
    else
      return <div className={'h-column-sort'}/>;
  }


  getColumnFilterComponent(columnName, columnMetadata) {
    var isFiltered = columnMetadata.isFiltered;
    var getDistinct = function () {
      return this.props.getDistinct(columnName);
    };
    if (isFiltered) {
      return <ColumnFilter getOptions={getDistinct}/>;
    } else {
      return;
    }
  }


  /**
   * All the TH elements
   */
  @autobind
  getTableHeadContent() {
    var headerContents = [];
    var columns = this.props.columns;
    for (let i = 0, _len = columns.length; i < _len; i++){
      let columnName = columns[i];
      let metadata = this.getColumnMetadata(columnName);
      if(metadata){
        headerContents.push(<th className={metadata.cssClassName}>
          <div className='h-column-header-wrapper'>
            <div className={`h-column-name ${metadata.isSortable ? 'sortable' : ''}`} onClick={this.makeColumnClickHandler(columnName, metadata)}>
              {this.getColumnSortComponent(columnName, metadata)}
              {metadata.displayName}
            </div>
            {this.getColumnFilterComponent(columnName, metadata)}
          </div>
        </th>);
      } else {
        headerContents.push(<th onClick={this.makeColumnClickHandler(columnName, metadata)}>{columnName}</th>);
      }
    }
    return (
      <tr>
        {headerContents}
      </tr>
    );
  }


  /**
   * Get a single TR element, containing all the TD elements for
   * this rowData object.
   */
  @autobind
  getTableBodyRow(rowData) {
    var columns = this.props.columns;
    var rowContent = [];
    for (let i = 0, _len = columns.length; i < _len; i++) {
      let columnName = columns[i];
      let cellData = rowData[columnName];
      let metadata = this.getColumnMetadata(columnName);
      let className = metadata ? metadata.cssClassName : '';
      rowContent.push(
        <td className={className}>{metadata.rowComponent? metadata.rowComponent(rowData) : cellData}</td>
      );
    }
    return (<tr>{rowContent}</tr>);
  }


  /**
   * Get a list of TR elements.
   */
  @autobind
  getTableBodyContent() {
    return this.props.rows.map(this.getTableBodyRow);
  }


  /**
   * Get the markup for the entire table.
   */
  @autobind
  render() {
    return (
      <table className={this.getTableClassName()}>
        <thead>
          {this.getTableHeadContent()}
        </thead>
        <tbody>
          {this.getTableBodyContent()}
        </tbody>
      </table>
    );
  }
}

export default HTable;
