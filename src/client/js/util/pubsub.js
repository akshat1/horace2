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
  getListenerArray(eventName).push(fn);
}


function unsubscribe(eventName, fn) {
  var arr = getListenerArray(eventName);
  arr = arr.remove(fn);
};


function broadcast(eventName, payload) {
  var arr = getListenerArray(eventName);
  for(let i = 0; i < arr.length; i++) {
    let fn = arr[i];
    let returnValue = fn(payload);
    // Stop execution if a broadcast listener returns false
    if(returnValue === false) {
      return;
    }
  }
}

const PubSub = {
  getListenerArray : getListenerArray,
  subscribe        : subscribe,
  unsubscribe      : unsubscribe,
  broadcast        : broadcast
};

export default PubSub;
