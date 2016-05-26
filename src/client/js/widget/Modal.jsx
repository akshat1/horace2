'use strict';
const React = require('react');
const {WidgetStyleClass} = require('./WidgetBase.js');


const StyleClass = {
  ROOT    : 'h-modal',
  W1      : 'h-modal-wrapper-1',
  W2      : 'h-modal-wrapper-2',
  CONTENT : 'h-modal-content'
};


const Modal = (props) =>
  <div className = {StyleClass.ROOT}>
    <div className = {StyleClass.W1}>
      <div className = {StyleClass.W2}>
        <div className = {StyleClass.CONTENT}>
          {props.children}
        </div>
      </div>
    </div>
  </div>


module.exports = Modal;
