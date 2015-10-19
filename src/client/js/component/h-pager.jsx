'use strict';
import React from 'react';
import autobind from 'autobind-decorator';

class HPager extends React.Component{
  constructor(props) {
    super(props);
  }


  // ------------------- Logic (or lack of) ----------------------
  @autobind
  handlePreviousClick() {
    if (this.props.currentPage)
      this.props.setPage(this.props.currentPage - 1);
  }

  @autobind
  handleNextClick() {
    if (this.props.currentPage < this.props.maxPages)
      this.props.setPage(this.props.currentPage + 1);
  }

  @autobind
  handlePageSelect(e) {
    this.props.setPage(e.currentTarget.value);
  }

  // -------------------------/ Logic ----------------------------


  // ------------------------- Render ----------------------------
  getPageSelectOptions() {
    var options = [];
    for(let i = 0, _len = this.props.maxPages; i < _len; i++){
      options.push(<option value={i} key={i}>{i + 1}</option>);
    }
    return options;
  }


  getPreviousComponent() {
    var isDisabled = this.props.currentPage === 0;
    return (<button className='h-pager-previous' disabled={isDisabled} onClick={this.handlePreviousClick}>Previous</button>);
  }


  getNextComponent() {
    var isDisabled = this.props.currentPage >= this.props.maxPages - 1;
    return (<button className='h-pager-next' disabled={isDisabled} onClick={this.handleNextClick}>Next</button>);
  }


  getPageSelectComponent() {
    return (
      <div className='h-pager-pages'>
        <select value={this.props.currentPage} onChange={this.handlePageSelect}>
          {this.getPageSelectOptions()}
        </select>
        <span>of {this.props.maxPages}</span>
      </div>
    );
  }
  // ------------------------ /Render ----------------------------

  render() {
    return (
      <div className='h-pager'>
        {this.getPreviousComponent()}
        {this.getPageSelectComponent()}
        {this.getNextComponent()}
      </div>
    );
  }
}

export default HPager;
