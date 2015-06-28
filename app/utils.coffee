###
General utilities
###

$FS = require 'fs'

module.exports =
  getHash : (path)->
    return hash unless path.length > 0
    for i in [0...path.length]
      ch = path.charCodeAt i
      hash = ((hash << 5) - hash) + ch
      hash = hash & hash
    hash