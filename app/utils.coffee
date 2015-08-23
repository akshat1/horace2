###
General utilities
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
