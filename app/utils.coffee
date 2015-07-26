###
General utilities
###

module.exports =
  getHash : (path)->
    throw new Error 'Missing argument to generate hash from' unless path?.length
    for i in [0...path.length]
      ch = path.charCodeAt i
      hash = ((hash << 5) - hash) + ch
      hash = hash & hash
    hash


  ###*
   * @param {array} Array of Promises
   * @param {function} A function that accepts the result of each promise, and returns a boolean value.
   * @return {promise}
   * @resolve with the first value that satisfies the test condition
   * @reject rejects when no valid values have been received
  ###
  conditionalRace: (promises, condition) ->
    unless condition
      condition = (x) -> x
    pending = promises.length
    primary = new Promise (resolve, reject) ->
      errors = []
      checkCompletion = () ->
        if pending is 0
          reject new Error 'No valid values'

      for p, index in promises
        p.catch (err) ->
          console.error 'Error occurred', err
          pending--
          errors.push err
          checkCompletion()

        p.then (result) ->
          pending--
          if condition result
            resolve result

          else
            checkCompletion()
    primary
