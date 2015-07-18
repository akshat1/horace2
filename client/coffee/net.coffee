$H = require './http.coffee'
_ = require 'lodash'
$ServerEvents = require '../../app/server-events.coffee'

_socket = null

# Create an iframe to download a file
# TODO: Destroy IFrame post download
downloadFile = (url, success) ->
  _frame = document.createElement 'iframe'
  _frame.className = 'downloadFrame'
  _frame.height = '100px'
  _frame.width = '100px'
  document.body.appendChild _frame
  _frame.src = url


getSocket = () ->
  unless _socket
    _socket = io.connect window.location.origin,
      path: HoraceConf.socketIOURL
  _socket


dispatch = (eventName, args) ->
  console.debug 'dispatch(%s, %o)', eventName, args
  socket = getSocket()
  socket.emit eventName, args


_on = (eventName, callback) ->
  getSocket().on eventName, callback


_off = (eventName, callback) ->
  getSocket().off eventName, callback


getBooks = (query) ->
  opts =
    url : '/api/books'
    responseType : $H.ResponseType.JSON
    data : query
  # remember get returns a promise
  $H.get opts


requestDownload = (book) ->
  console.debug 'requestDownload(%o)', book
  ###
  opts =
    url : '/api/requestDownload'
    data :
      id : book.id
  $H.get opts
  ###
  dispatch $ServerEvents.REQUEST_BOOK_DOWNLOAD,
    bookId: book.id



_.extend module.exports,
  dispatch : dispatch
  'on'     : _on
  'off'    : _off
  getBooks : getBooks
  requestDownload: requestDownload
