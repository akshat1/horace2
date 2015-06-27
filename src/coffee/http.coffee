Method =
  POST   : 'POST'
  GET    : 'GET'
  PUT    : 'PUT'
  DELETE : 'DELETE'


# See http://www.restapitutorial.com/httpstatuscodes.html
# TODO: Add ALL the codes?
StatusCode =
  OK                  : 200
  NotModified         : 304
  BadRequest          : 400
  Unauthorized        : 401
  Forbidden           : 403
  NotFound            : 404
  MethodNotAllowed    : 405
  Conflict            : 409
  InternalServerError : 500


Mime =
  TEXT           : 'text/plain'
  HALJSON        : 'application/hal+json'
  JSON           : 'application/json'
  FORMURLENCODED : 'application/x-www-form-urlencoded'
  FORMDATA       : 'multipart/form-data'
  XML            : 'text/xml'


ResponseType =
  DOMSTRING   : ''
  ARRAYBUFFER : 'arraybuffer'
  BLOB        : 'blob'
  DOCUMENT    : 'document'
  JSON        : 'json'
  TEXT        : 'text'


ReadyState =
  UNINITIALIZED : 0
  LOADING       : 1
  LOADED        : 2
  INTERACTIVE   : 3
  COMPLETE      : 4


# -------------------------------------- Various Functions --------------------------------------
Do = {}

###
  If request.responseType isnt '' then use that
  else, if 'content-type' header is supplied then match mime-type to response-type
###
_inferResponseType = (request) ->
  responseType = request.contentType
  if responseType
    return responseType

  contentType = request.getResponseHeader 'content-type'
  if contentType in [Mime.HALJSON, Mime.JSON]
    ResponseType.JSON

  else
    ''


_extractResult = (request, opts) ->
  responseType = (opts.responseTypeResolver or _inferResponseType) request
  console.debug "request.responseType: #{request.responseType}"
  console.debug "request.headers['content-type']: "
  window._xr = request
  switch responseType
    when ResponseType.JSON
      JSON.parse request.response
    when ResponseType.ARRAYBUFFER, ResponseType.BLOB, ResponseType.DOCUMENT
      request.response
    else
      request.responseText


_extractError = (request, opts) ->
  # TODO: Fix Me.
  new Error request.responseText


_preparePayload = (data, contentType, method) ->
  console.warn 'Implement ME...'


_setHeaders = (request, headers = {}) ->
  for key, value in headers
    request.setRequestHeader key, value


# Returns an executor function for the given XHR request
_getAjaxPromiseExecutor = (request, opts) ->
  (resolve, reject) ->
    request.ontimeout = () ->
      reject new Error 'XHR timed-out'

    request.onreadystatechange = () ->
      unless request.readyState is ReadyState.COMPLETE
        # For this version, we won't handle other readystates
        return

      if request.status is StatusCode.OK
        resolve (opts.resultExtractor or _extractResult) request, opts
      else
        reject _extractError request, opts
      return
    return


###
  opts:
    url
    method
    async
    data
    headers
    responseType
    contentType
    username
    password
    timeout
    responseTypeResolver
    resultExtractor
###
ajax = (opts) ->
  payload = _preparePayload opts.data, opts.contentType, opts.method
  method  = opts.method or Method.GET
  isAsync = if opts.hasOwnProperty('async') then opts.async else false

  request = new XMLHttpRequest()
  _setHeaders request
  request.timeout = opts.timeout if opts.hasOwnProperty 'timeout'
  promise = new Promise _getAjaxPromiseExecutor request, opts
  request.open method, opts.url, isAsync, opts.user, opts.password
  if opts.hasOwnProperty 'responseType'
    request.overrideMimeType opts.responseType
  request.send()
  promise


module.exports =
  Method       : Method
  StatusCode   : StatusCode
  Mime         : Mime
  ResponseType : ResponseType
  ReadyState   : ReadyState
  ajax         : ajax
  get : (opts) ->
    opts.method = Method.GET
    ajax opts


  post : (opts) ->
    opts.method = Method.POST
    ajax opts


  put : (opts) ->
    opts.method = Method.PUT
    ajax opts


  'delete' : (opts) ->
    opts.method = Method.DELETE
    ajax opts

