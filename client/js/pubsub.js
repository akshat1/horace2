var broadcast, exports, getListenerArray, listenerMap, removeListener, subscribe;

listenerMap = {};

getListenerArray = function(eventName) {
  var arr;
  arr = listenerMap[eventName];
  if (!arr) {
    arr = listenerMap[eventName] = [];
  }
  return arr;
};

subscribe = function(eventName, fn) {
  getListenerArray(eventName).push(fn);
};

removeListener = function(eventName, fn) {
  var arr;
  arr = getListenerArray(eventName);
  arr = arr.remove(fn);
};

broadcast = function(eventName, payload) {
  var arr, fn, i, len, returnValue;
  arr = getListenerArray(eventName);
  for (i = 0, len = arr.length; i < len; i++) {
    fn = arr[i];
    returnValue = fn(payload);
    if (returnValue === false) {
      return;
    }
  }
};

module.exports = {
  getListenerArray: getListenerArray,
  subscribe: subscribe,
  removeListener: removeListener,
  broadcast: broadcast,
  _listenerMap: listenerMap
};
