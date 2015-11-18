'use strict';

const Method = {
  POST   : 'POST',
  GET    : 'GET',
  PUT    : 'PUT',
  DELETE : 'DELETE'
};


const StatusCode = {
  OK                  : 200,
  NotModified         : 304,
  BadRequest          : 400,
  Unauthorized        : 401,
  Forbidden           : 403,
  NotFound            : 404,
  MethodNotAllowed    : 405,
  Conflict            : 409,
  InternalServerError : 500
};


const Mime = {
  TEXT           : 'text/plain',
  HALJSON        : 'application/hal+json',
  JSON           : 'application/json',
  FORMURLENCODED : 'application/x-www-form-urlencoded',
  FORMDATA       : 'multipart/form-data',
  XML            : 'text/xml'
};


const ResponseType = {
  DOMSTRING   : '',
  ARRAYBUFFER : 'arraybuffer',
  BLOB        : 'blob',
  DOCUMENT    : 'document',
  JSON        : 'json',
  TEXT        : 'text'
};


const ReadyState = {
  UNINITIALIZED : 0,
  LOADING       : 1,
  LOADED        : 2,
  INTERACTIVE   : 3,
  COMPLETE      : 4
};


function _extractResult(request, opts) {
  var responseType;
  responseType = opts.responseType;
  switch (responseType) {
    case ResponseType.JSON:
      return JSON.parse(request.response);
    case ResponseType.ARRAYBUFFER:
    case ResponseType.BLOB:
    case ResponseType.DOCUMENT:
      return request.response;
    default:
      return request.responseText;
  }
}


function _extractError(request) {
  return new Error(request.responseText);
}


function _preparePayload(data, contentType, method) {
  var key, payloadItems, value;
  if (method === Method.GET) {
    payloadItems = [];
    for (key in data) {
      value = data[key];
      payloadItems.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    return payloadItems.join('&');
  } else if(method === Method.POST && contentType === Mime.JSON) {
    return JSON.stringify(data);
  } else {
    return console.error('Implement Me!');
  }
}


function _prepareHeaders(opts) {
  var headers = {};
  if (opts.hasOwnProperty('contentType'))
    headers['Content-Type'] = opts.contentType;
  return headers;
}


function _setHeaders(request, headers) {
  for (var key in headers){
    request.setRequestHeader(key, headers[key]);
  }
}


function _getAjaxPromiseExecutor(request, opts) {
  return function(resolve, reject) {
    request.ontimeout = function() {
      return reject(new Error('XHR timed-out'));
    };
    request.onreadystatechange = function() {
      if (request.readyState !== ReadyState.COMPLETE) {
        return;
      }
      if (request.status === StatusCode.OK) {
        resolve((opts.resultExtractor || _extractResult)(request, opts));
      } else {
        reject(_extractError(request, opts));
      }
    };
  };
}

/*
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
 */

function ajax(opts) {
  var isAsync, method, payload, promise, request, url;
  if(!opts.contentType)
    opts.contentType = Mime.JSON;
  payload = _preparePayload(opts.data, opts.contentType, opts.method);
  method = opts.method || Method.GET;
  isAsync = opts.hasOwnProperty('async') ? opts.async : true;
  request = new XMLHttpRequest();
  if (opts.hasOwnProperty('timeout')) {
    request.timeout = opts.timeout;
  }
  if (opts.method === Method.GET) {
    url = `${opts.url}?${payload}`;
  } else {
    url = opts.url;
  }
  request.open(method, url, isAsync, opts.user, opts.password);
  _setHeaders(request, _prepareHeaders(opts));
  promise = new Promise(_getAjaxPromiseExecutor(request, opts));
  if(method === Method.POST)
    request.send(payload);
  else
    request.send();
  return promise;
}


module.exports = {
  Method       : Method,
  StatusCode   : StatusCode,
  Mime         : Mime,
  ResponseType : ResponseType,
  ReadyState   : ReadyState,
  ajax         : ajax,
  get: function(opts) {
    opts.method = Method.GET;
    return ajax(opts);
  },

  post: function(opts) {
    opts.method = Method.POST;
    return ajax(opts);
  },

  put: function(opts) {
    opts.method = Method.PUT;
    return ajax(opts);
  },

  'delete': function(opts) {
    opts.method = Method.DELETE;
    return ajax(opts);
  }
};
