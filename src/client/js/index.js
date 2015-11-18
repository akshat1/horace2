'use strict';

/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import Library from './component/library.jsx';

document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(
    <Library />,
    document.getElementById('libraryRoot')
  );
});