'use strict';
import React from 'react';
import autobind from 'autobind-decorator';
import _ from 'lodash';

import { SortModel } from './../../../app/model/library-model.js';
import PubSub from './../util/pubsub.js';
import {Client as ClientEvents} from './../../../app/events.js';


/*
TODO: Use this
const StyleClass = {
  Ascending  : 'fa-sort-asc',
  Descending : 'fa-sort-desc',
  Sorted     : 'fa',
  Sortable   : 'h-sortable'
};
*/


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
    var headerContents = [];
    var columns = this.props.columns;
    for (let i = 0, _len = columns.length; i < _len; i++){
      let columnName = columns[i];
      let metadata = this.getColumnMetadata(columnName);
      if(metadata){
        headerContents.push(<th key={`TH_${i}`} className={metadata.cssClassName}>
          <div className='h-column-header-wrapper'>
            <div className={`h-column-name ${metadata.isSortable ? 'sortable' : ''}`} onClick={this.makeColumnClickHandler(columnName, metadata)}>
              {this.renderColumnSortComponent(columnName, metadata)}
              {metadata.displayName}
            </div>
            {this.renderColumnFilterComponent(columnName, metadata)}
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
  renderTableBodyRow(rowData, rowIndex) {
    var columns = this.props.columns;
    var rowContent = [];
    for (let i = 0, _len = columns.length; i < _len; i++) {
      let columnName = columns[i];
      let cellData = rowData[columnName];
      let metadata = this.getColumnMetadata(columnName);
      let className = metadata ? metadata.cssClassName : '';
      rowContent.push(
        <td key={`${rowIndex}_${i}`} className={className}>{metadata.rowComponent? metadata.rowComponent(rowData) : cellData}</td>
      );
    }
    return (<tr key={rowIndex}>{rowContent}</tr>);
  }


  /**
   * Get a list of TR elements.
   */
  @autobind
  renderTableBodyContent() {
    return this.props.rows.map(this.renderTableBodyRow);
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

export default HTable;
