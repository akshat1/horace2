'use strict';


const _api = '/api';


var Server = {
  API: _api
};

var Client = {};


function getClientFunction(prefix, path){
  return function () {
    let params = path.match(/(:[^:\/]+)/g) || [];
    let parts = prefix;
    let finalPath = path;
    let paramValues = Array.prototype.slice.apply(arguments);
    for (let i = 0, _argsLen = arguments.length, _paramsLen = params.length; i < _argsLen && i < params.length; i++ ){
      finalPath = finalPath.replace(params[i], encodeURIComponent(paramValues[i]));
    }
    return (prefix + '/' + finalPath).replace(/\/+/g, '/');
  }
}


// Path will be prefixed by _api for client
// Should be use for end-points which are registered
// into ApiRouter in index.js
function registerApi(key, path) {
  Client[key] = typeof path === 'string' ? getClientFunction(_api, path) : path;
  Server[key] = path;
}


// For URLS without any prefix on client or server
function register(key, path) {
  Client[key] = typeof path === 'string' ? getClientFunction('', path) : path;
  Server[key] = path;
}


registerApi('Command.StartScan', '/command/StartScan');
registerApi('Status.IsScanning', '/status/isScanning');
register('Config', '/config');
registerApi('Books', '/books');
registerApi('Books.Distinct', '/books/distinct/:columnName');
register('fileDownload', function(fileName) {
    return `/download/${fileName}`;
  });


var UrlMap = {
  Server: Server,
  Client: Client,
  getClientFunction: getClientFunction
};

export default UrlMap;