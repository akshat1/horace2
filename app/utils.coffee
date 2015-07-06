###
General utilities
###

module.exports =
  getHash : (path)->
    return hash unless path.length > 0
    for i in [0...path.length]
      ch = path.charCodeAt i
      hash = ((hash << 5) - hash) + ch
      hash = hash & hash
    hash


  conditionalRace: (promises, condition) ->
    pending = promises.length
    primary = new Promise (resolve, reject) ->
      errors = []
      checkCompletion = () ->
        if pending is 0
          reject()

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
