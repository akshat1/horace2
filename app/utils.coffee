###*
# General utilities
# @module utils
###
getHash = (path)->
  throw new Error 'Missing argument to generate hash from' unless path?.length
  for i in [0...path.length]
    ch = path.charCodeAt i
    hash = ((hash << 5) - hash) + ch
    hash = hash & hash
  hash


###*
# @param {array} Array of Promises
# @param {function} A function that accepts the result of each promise, and returns a boolean value.
# @param {boolean} whether or not to break on error. default false (i.e. exceptions will be eaten)
# @return {promise}
# @resolve with the first value that satisfies the test condition, or null if no valid values are found
# @reject rejects with the first error encountered iff breakOnError is true
###
conditionalRace = (promises, condition, breakOnError) ->
  unless condition
    condition = (x) -> x
  pending = promises.length
  primary = new Promise (resolve, reject) ->
    checkCompletion = () ->
      if pending is 0
        resolve()

    for p, index in promises
      p.catch (err) ->
        pending--
        if breakOnError
          reject err
        else
          checkCompletion()

      p.then (result) ->
        pending--
        if condition result
          resolve result

        else
          checkCompletion()
  primary


###*
# @param {Array} arr - Array of the objets to be processed
# @param {function} fnGetter - function which returns a Promise which resolves, hopefully 
                    in a value that satisifes fnCondition. Of the form (arr[i], i) ->
# @param {function} fnCondition - function which returns a boolean, or a promise which 
                    resolves in a boolean about the fitness of the result of fnGetter
# @param {boolean} breakOnError - whether any errors will break all execution and cause 
                   the returned promise to fail
# @returns {Promise} - A promise which resolves in the value which satisfied fnCondition
###
findPromise = (arr, fnGetter, fnCondition, breakOnError) ->
  new Promise (resolve, reject) ->
    index = 0
    next = () ->
      index++
      setTimeout tick
      return
    
    tick = () ->
      if index >= arr.length
        #console.log 'Nothing satisfied testFunc so exiting at ', index, ' with object ', candidate
        resolve null
        return

      candidate = arr[index]

      fnGetter.call null, candidate, index
        .then (obj) ->
          toPromise fnCondition.call null, obj
            .then (isValid) -> if isValid then obj else null

        .then (obj) ->
          if obj
            resolve obj

          else
            next()

        .catch (err) -> 
          if breakOnError
            reject err

          else
            next()
    tick()


###*
# Execute fn on each item of arr in sequence. Expect promise from fn. Move to 
# i + 1 only when promise for i has resolved.
# @param {Array} arr - Array of objects to be processed
# @param {function} fn - A function of the form function(obj, index) which returns a promise
# @param {boolean} breakOnError - Whether or not execution should stop when any promise rejects
###
forEachPromise = (arr, fn, breakOnError) ->
  new Promise (resolve, reject) ->
    index = 0
    result = []
    next = () ->
      index++
      setTimeout tick

    tick = () ->
      if index >= arr.length
        resolve result
        return

      candidate = arr[index]
      fn candidate, index
        .then (resultForIndex) -> 
          result.push resultForIndex
          next()

        .catch (err) -> 
          if breakOnError
            reject err

          else
            next()
          

    tick()



###*
# Returns a boolean indidicating whether or not the param is a Promise
# Uses instanceof
# @param {object} x
# @return {boolean} x instanceof Promise
###
isPromise = (x) -> x instanceof Promise


###*
# Returns a promise which resolves into the supplied argument.
# Returns the argument as is when supplied with a promise.
# @param x {object}
# @returns {promise}
###
toPromise = (x) ->
  if isPromise x
    x
  else
    new Promise (resolve, reject) -> resolve x


module.exports = 
  getHash         : getHash
  conditionalRace : conditionalRace
  isPromise       : isPromise
  toPromise       : toPromise
  findPromise     : findPromise
  forEachPromise  : forEachPromise
