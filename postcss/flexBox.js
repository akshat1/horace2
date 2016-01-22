'use strict';

var NoValue = "''";

// resolve final value
function res(suppliedValue, defaultValue) {
  return suppliedValue && suppliedValue !== NoValue ? suppliedValue : defaultValue;
}

function flexBox(mixin, direction, wrap, justifyContent, alignItems, alignContent) {
  return {
    display           : 'flex',
    'flex-direction'  : res(direction, 'column'),
    'flex-wrap'       : res(wrap, 'nowrap'),
    'justify-content' : res(justifyContent, 'center'),
    'align-items'     : res(alignItems, 'stretch'),
    'align-content'   : res(alignContent, 'flex-start')
  };
}


function flexItem(mixin, grow, shrink) {
  return {
    'flex-grow'   : res(grow, 0),
    'flex-shrink' : res(shrink, 0)
  };
}


module.exports = {
  flexBox  : flexBox,
  flexItem : flexItem
};
