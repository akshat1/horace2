$Path = require 'path'

$Winston     = require 'winston'
$Express     = require 'express'
$ServeStatic = require 'serve-static'
$SocketIO    = require 'socket.io'
$FSExtra     = require 'fs-extra'


console.log 'start gulp'
Gulp     = require 'gulp'
GulpFile = require '../gulpfile.js'
Gulp.start 'default'


$Config = require './config.coffee'
$Utils  = require './utils.coffee'


# ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
console.log $Config

logLevel      = $Config 'horace.logLevel'
serverTmpPath = $Path.join __dirname, '..', $Config('horace.tmpDirPath')
# This is useful when configuring behind a reverse-proxy
serverSubDir  = $Config('horace.urlSubDir').replace(/\/$/, '') or '/'
webroot       = $Path.join __dirname, '..', $Config('horace.webroot')
listenPort    = new Number($Config('horace.port')).valueOf()

console.log 'listenPort    : ', listenPort
console.log 'serverTmpPath : ', serverTmpPath
console.log 'webroot       : ', webroot


logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: logLevel
      }),
    new $Winston.transports.File({
      filename: 'horace.log'
      })
  ]


# Initialise FS
$FSExtra.ensureDir serverTmpPath
$FSExtra.ensureDir webroot


# Initialise Express
app = $Express()
# File downloads
downloadDirURL = $Path.join(serverSubDir, 'download')
webrootURL     = $Path.join(serverSubDir, serverSubDir).replace(/\./, '/')
console.log 'downloadDirURL : ', downloadDirURL
console.log 'webrootURL     : ', webrootURL
app.use downloadDirURL, $ServeStatic serverTmpPath
app.use webrootURL, $ServeStatic webroot

# Client Config
app.use '/config', (req, res) ->
  str = """
    window.HoraceConf = #{JSON.stringify $Config('web.client.config')};
    window.HoraceConf['webrootURL'] = "#{webrootURL}";
    window.HoraceConf['socketIOURL'] = "#{socketIOURL}";
  """
  res.send str

# API
# Sockets

# Start HTTP Server
server = app.listen listenPort, () ->
  logger.info "Listening on #{@address()}"

# Start websocket
socketIOURL = $Path.join serverSubDir, 'socket.io'
io = $SocketIO.listen server,
  path: socketIOURL

io.on 'connection', (socket)->
  # Register socket events.
  socket.emit 'hello', {id:socket.id}

