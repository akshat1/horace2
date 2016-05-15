/**
A transform is somewhat similar to what reducers do in redux. The purpose of transforms
is for 'massaging' data, so they do mutate data. But we give them a clone of the state
in applySequence.

function(oldState) {
  ...
  return newState;
}

Store will call transforms one after. The order of transforms matters.
*/


function listSelectedBooks(state) {
  state.selectedBooks = Object.keys(state.selectedBookIdMap);
  return state;
}


// This one mutates each book.
function transformBooks(state) {
  let idMap = state.selectedBookIdMap;
  state.books.forEach(function(b) {
    b.isSelected = !!idMap[b.id];
    if (b.year === -1)
      b.displayYear = '-';
    b.authors  = b.authors.filter( (a) => a && a.trim())
    b.subjects = b.subjects.filter( (s) => s && s.trim())
  });
  return state;
}


const sequence = [
  listSelectedBooks,
  transformBooks
];


function applySequence(state) {
  state = Object.assign({}, state);
  return sequence.reduce(function(s, transform) {
    return transform(s);
  }, state);
}


module.exports = {
  listSelectedBooks : listSelectedBooks,
  transformBooks    : transformBooks,
  sequence          : sequence,
  applySequence     : applySequence
};
