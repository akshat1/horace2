Net = module.exports


# Create an iframe to download a file
# TODO: Destroy IFrame post download
Net.downloadFile = (url, success) ->
  _frame = document.createElement 'iframe'
  _frame.className = 'downloadFrame'
  _frame.height = '100px'
  _frame.width = '100px'
  document.body.appendChild _frame
  _frame.src = url


getSocket = () ->
  unless Net._socket
    Net._socket = io.connect window.location.origin,
      path: HoraceConf.socketIOURL

  Net._socket
Net.getSocket = getSocket


Net.dispatch = (eventName, args) ->
  socket = getSocket()
  socket.emit eventName, args


Net.on = (eventName, callback) ->
  getSocket().on eventName, callback


Net.off = (eventName, callback) ->
  getSocket().off eventName, callback


