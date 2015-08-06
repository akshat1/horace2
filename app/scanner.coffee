$Path    = require 'path'
$FS      = require 'graceful-fs'
$Winston = require 'winston'
_        = require 'lodash'

$Config   = require './config.coffee'
$Adapters = require './adapter.coffee'
$DB       = require './db.coffee'


logLevel = $Config 'horace.scanner.logLevel'
logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: logLevel
      }),
    new $Winston.transports.File({
      filename: 'horace-scanner.log'
      })
  ]


# ---------- ---------- ---------- ---------- ---------- ---------- 


_scanPath = (path) ->
  logger.info "_scanPath(#{path})"
  new Promise (resolve, reject) ->
    $Adapters.getBook path
      .then (oBook) ->
        logger.debug "got book? #{!oBook}", oBook
        if oBook
          logger.debug 'resolve with oBook'
          resolve $DB.saveBook oBook

        else
          logger.debug 'Check if path is a directory'
          $FS.stat path, (statErr, oStat) ->
            if statErr
              logger.error "Error stating path #{path}", statErr

            else
              logger.debug "is it a directory then? #{oStat.isDirectory()}"
              if oStat.isDirectory()
                logger.debug 'it is a directory. read it'
                $FS.readdir path, (readdirErr, files) ->
                  if readdirErr
                    logger.error 'error doing readdir', readdirErr
                    reject readdirErr

                  else
                    logger.debug "We got #{files.length} files"
                    p = Promise.all _.map files, (f) ->
                      _scanPath $Path.join path, f

                    p.then (res) ->
                      resolve res

                    p.catch (err0) ->
                      logger.error '_scanPath failed!'
                      reject err0

              else
                resolve null

      .catch (adapterErr) ->
        logger.error "adapterErr for path #{path}", adapterErr
        # We don't break when we get an error about a file.


scanPath = (path) -> 
  _scanPath path


# ---------- ---------- ---------- ---------- ---------- ---------- 


module.exports =
  scanPath : scanPath
