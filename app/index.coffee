$Path = require 'path'

$Winston     = require 'winston'
$Express     = require 'express'
$ServeStatic = require 'serve-static'
$SocketIO    = require 'socket.io'
$FSExtra     = require 'fs-extra'
$URL         = require 'url'
_            = require 'lodash'


$Config = require './config.coffee'
$Utils  = require './utils.coffee'
$Horace = require './horace.coffee'

if $Config 'horace.rebuildClientAtStartup'
  console.log 'start gulp'
  Gulp     = require 'gulp'
  GulpFile = require '../gulpfile.js'
  Gulp.start 'default'


# ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
logLevel      = $Config 'horace.server.logLevel'
console.log 'logLevel: ', logLevel
serverTmpPath = $Path.join __dirname, '..', $Config('horace.tmpDirPath')
# This is useful when configuring behind a reverse-proxy
serverSubDir  = $Config('horace.urlSubDir').replace(/\/$/, '') or '/'
webroot       = $Path.join __dirname, '..', $Config('horace.webroot')
listenPort    = new Number($Config('horace.port')).valueOf()

logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: logLevel
      }),
    new $Winston.transports.File({
      filename: 'horace-server.log'
      })
  ]

logger.info 'listenPort    : ', listenPort
logger.info 'serverTmpPath : ', serverTmpPath
logger.info 'webroot       : ', webroot


# Initialise FS
$FSExtra.ensureDir serverTmpPath
$FSExtra.ensureDir webroot


# Initialise Express
app = $Express()
# File downloads
downloadDirURL = $Path.join(serverSubDir, 'download')
webrootURL     = $Path.join(serverSubDir, serverSubDir).replace(/\./, '/')
logger.info 'downloadDirURL : ', downloadDirURL
logger.info 'webrootURL     : ', webrootURL
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

# Wire up API end-points
apiRouter = $Express.Router()
apiRouter.get '/command/StartScan', (request, response) ->
  logger.debug 'Start Scan'
  $Horace.startScan()
  response.send 'OK'


apiRouter.get '/books', (request, response) ->
  logger.debug 'getBooks'
  query = $URL.parse(request.url, true).query
  $Horace.getBooks query
    .catch (err) ->
      logger.error 'Error fetching books from Horace %o', error
      response.status(500).send err

    .then (books = []) ->
      logger.debug 'Got %d books', books.length
      response.json books


app.use '/api', apiRouter


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

  # Pass all Horace events to clients
  eventNameKeys = _.keys $Horace.Event
  _.each eventNameKeys, (key) ->
      eventName = $Horace.Event[key]
      $Horace.on eventName, (args...) ->
        args.unshift eventName
        socket.emit.apply socket, args

$Horace.on 

