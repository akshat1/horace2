
Net = require './net.coffee'

Net.on 'ScanStarted', () ->
  console.debug 'Scan Started'
  console.debug arguments

window.Net = Net