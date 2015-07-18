
listenerMap = {}


getListenerArray = (eventName) ->
  arr = listenerMap[eventName]
  unless arr
    arr = listenerMap[eventName] = []
  arr


subscribe = (eventName, fn) ->
  getListenerArray(eventName).push fn
  return


removeListener = (eventName, fn) ->
  arr = getListenerArray eventName
  arr = arr.remove fn
  return


broadcast = (eventName, payload) ->
  arr = getListenerArray eventName
  for fn in arr
    returnValue = fn payload
    # Break execution iff return value === false
    return if returnValue is false
  return



exports =
  getListenerArray : getListenerArray
  subscribe        : subscribe
  removeListener   : removeListener
  broadcast        : broadcast
  _listenerMap     : listenerMap

window.__exports = exports

module.exports = exports
