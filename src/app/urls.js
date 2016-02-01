'use strict';


/**
 * Returns a function which will itself return a string given values for rest parameters in path
 * @params {String} prefix
 * @params {String} path
 * @returns {function}
 */
export function getClientFunction(prefix, path){
  return function () {
    let params = path.match(/(:[^:\/]+)/g) || [];
    let finalPath = path;
    let paramValues = Array.prototype.slice.apply(arguments);
    for (let i = 0, _argsLen = arguments.length, _paramsLen = params.length; i < _argsLen && i < _paramsLen; i++ ){
      finalPath = finalPath.replace(params[i], encodeURIComponent(paramValues[i]));
    }
    return (prefix + '/' + finalPath).replace(/\/+/g, '/');
  };
}


// Path will be prefixed by api for client
// Should be use for end-points which are registered
// into ApiRouter in index.js
export function register(key, path, api, serverMap, clientMap) {
  clientMap[key] = typeof path === 'string' ? getClientFunction(api, path) : path;
  serverMap[key] = path;
}


export function doRegistrations(api, serverMap, clientMap) {
  register('Command.StartScan', '/command/StartScan', api, serverMap, clientMap);
  register('Status.IsScanning', '/status/isScanning', api, serverMap, clientMap);
  register('Config', '/config', '', serverMap, clientMap);
  register('Books', '/books', api, serverMap, clientMap);
  register('Books.Distinct', '/books/distinct/:columnName', api, serverMap, clientMap);
  register('fileDownload', getClientFunction('', '/download/:fileName'), '', serverMap, clientMap);
  register('Book.Hide', '/hide/:bookIds', api, serverMap, clientMap);
  register('Books.Unhide', '/unhide', api, serverMap, clientMap);
}


var UrlMap = {
  Server: {
    API: '/api'
  },
  Client: {},
  getClientFunction: getClientFunction
};
doRegistrations(UrlMap.Server.API, UrlMap.Server, UrlMap.Client);

export default UrlMap;