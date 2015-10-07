"use strict"

require('./widgets/announcer.js');
var Library = require('./library.js');

document.addEventListener('DOMContentLoaded', function() {
  var oLibrary;
  oLibrary = window.oLibrary = new Library();
  return ko.applyBindings(oLibrary);
});
