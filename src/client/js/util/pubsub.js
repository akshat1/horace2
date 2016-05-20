'use strict';

/**
@module pubsub
Simple pubsub implementation
*/

var listenerMap = {};


function getListenerArray(eventName) {
  var arr = listenerMap[eventName];
  if (!arr)
    arr = listenerMap[eventName] = [];

  return arr;
}


function subscribe(eventName, fn) {
  if (typeof eventName !== 'string')
    throw new Error(`PubSub.subscribe: Expected eventName to be a string but it was ${typeof eventName}`);

  if (typeof fn !== 'function')
    throw new Error(`PubSub.subscribe: Expected fn to be a function but it was ${typeof fn}`);

  getListenerArray(eventName).push(fn);
}


/**
 * Subscribe using a map<String: eventName, Function: handler>
 * @param {Object} map
 */
function subscribeWithMap(map) {
  for(let eventName in map) {
    subscribe(eventName, map[eventName]);
  }
}


function unsubscribe(eventName, fn) {
  var arr = getListenerArray(eventName);
  arr = arr.remove(fn);
}


function broadcast(eventName, payload) {
  var arr = getListenerArray(eventName);
  for (let fn of arr) {
    let returnValue = fn(payload);
    // Stop execution if a broadcast listener returns false
    if(returnValue === false) {
      return;
    }
  }
}

const PubSub = {
  getListenerArray,
  subscribe,
  subscribeWithMap,
  unsubscribe,
  broadcast
};

module.exports = PubSub;
