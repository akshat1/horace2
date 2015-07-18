require './widgets/announcer.coffee'

Library = require './library.coffee'



document.addEventListener 'DOMContentLoaded', () ->
  # TODO: routing
  oLibrary = window.oLibrary = new Library()
  ko.applyBindings oLibrary
