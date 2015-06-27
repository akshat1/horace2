$Path     = require 'path'
$FS       = require 'graceful-fs'
$Adapters = require './adapter.coffee'


scanPath = (path) ->
  p = new Promise (resolve, reject) ->
    onFileListReceived = (error, files) ->
      if error
        reject error
      else
        promises = _.map files, (f) ->
          newPath = $Path.join path, j
          $Adapters.getBook newPath
        resolve Promise.all scanPath newPath

    $Adapters.getBook path
      .catch (err) -> reject err
      .then (book) ->
        if book
          # got a book. no need to do anything else.
          resolve book
        else
          # no book. check if this was a directory. If so, scan the directory.
          onStatReceived = (error, stat) ->
            if error
              reject error
            else if stat.isDirectory()
              # path is a directory, and we must examine each file in it.
              $FS.readdir path, onFileListReceived
            else
              # path is a file, but we have no adapters that may identify it.
              resolve null

          $FS.stat path, onStatReceived

module.exports =
  scanPath : scanPath
