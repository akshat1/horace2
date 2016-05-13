/**
A transform is somewhat similar to what reducers do in redux. The purpose of transforms
is for 'massaging' data. Transforms are not always pur functions; They do cause mutations
but we try to minimize that. Basically we know ideally they shouldn't be, but in some
cases it doesn't matter if they do and if it is more efficient to mutate data then we
do it.

function(oldState) {
  ...
  return newState;
}

Store will call transforms one after. The order of transforms matters.
*/


// This one does mutate each book.
function transformBooks(state) {
  let idMap = state.selectedBookIdMap;
  state.books.forEach(function(b) {
    b.isSelected = !!idMap[b.id];
  });
  return state;
}


const sequence = [
  transformBooks
];


function applySequence(state) {
  return sequence.reduce(function(s, transform) {
    return transform(s);
  }, state);
}


module.exports = {
  transformBooks: transformBooks,
  sequence: sequence,
  applySequence: applySequence
};
