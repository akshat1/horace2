'use strict';

import React from 'react';
import Library from './component/library.jsx';
 
document.addEventListener('DOMContentLoaded', function() {
  React.render(
    <Library />,
    document.getElementById('libraryRoot')
  );
});