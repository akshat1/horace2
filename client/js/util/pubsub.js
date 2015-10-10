'use strict';

/**
@module pubsub
Simple pubsub implementation
*/

var listenerMap = {};


export function getListenerArray(eventName) {
  var arr = listenerMap[eventName];
  if (!arr)
    arr = listenerMap[eventName] = [];

  return arr;
}


export function subscribe(eventName, fn) {
  getListenerArray(eventName).push(fn);
}


export function removeListener(eventName, fn) {
  var arr = getListenerArray(eventName);
  arr = arr.remove(fn);
};


export function broadcast(eventName, payload) {
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
