###*
# Requires exiftool to be installed
# @see http://www.sno.phy.queensu.ca/~phil/exiftool/install.html
# @module pdf adapter
###

$Path    = require 'path'
$FS      = require 'fs'
$Exec    = require('child_process').exec
$Winston = require 'winston'

$Book = require '../book.coffee'
$Formats = require '../formats.coffee'


ADAPTER_ID               = 'horace.pdf'
CMD                      = 'exiftool'
SUPPORTED_EXPORT_FORMATS = [$Formats.PDF]


logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: 'warn'
      }),
    new $Winston.transports.File({
      filename: $Path.join process.cwd(), 'horace-pdf-adapter.log'
      })
  ]


getExif = (path) ->
  p = new Promise (resolve, reject) ->
    $Exec """#{CMD} -j "#{path}" """, (err, stdOutBuff, stdErrBuff) ->
      if err
        reject err
      else
        if stdErrBuff
          reject stdErrBuff.toString()
        else
          exifData = JSON.parse(stdOutBuff.toString())[0]
          if exifData
            resolve exifData
          else
            reject new Error 'Unknown error. No exifdata.'
  p


getTitle = (exifdata) -> exifdata['Title'] or exifdata['FileName']
getAuthors = (exifdata) -> [exifdata['Author']]
getSizeInBytes = (exifdata) -> -1
getSubjects = (exifdata) -> [exifdata['Subject']]
getPublisher = () -> ''
getYear = () -> -1

getBook = (path) ->
  logger.info "getBook(#{path})"
  p = new Promise (resolve, reject) ->
    extension = $Path.extname path
    if extension.toLowerCase() isnt '.pdf'
      logger.info "#{path} is not a pdf file."
      resolve null
    else
      getExif path
        .catch (err) -> reject err
        .then (exifdata) ->
          logger.info 'Got exif %o', exifdata
          if exifdata
            try
            	book = new $Book path, getTitle(exifdata), getAuthors(exifdata), getSizeInBytes(exifdata), getYear(exifdata), getSubjects(exifdata), getPublisher(exifdata), ADAPTER_ID
            catch err1
              logger.error 'Error occurred: %o', err1
              reject err1
              return
            logger.debug 'resolve with: %o', book
            resolve book
            
          else
            logger.debug "No exifdata for #{path}"
            resolve()
  p


getBookForDownload = (book, targetFormat = $Formats.PDF) ->
  logger.info 'getBookForDownload(%o)', book
  new Promise (resolve, reject) ->
    unless targetFormat in SUPPORTED_EXPORT_FORMATS
      err = new Error "Target format not supported (>#{targetFormat}<)"
      logger.error err
      reject err
      return

    # For now we know targetFormat is PDF
    logger.debug "create readstream for path: >#{book.path}<"
    rStream = $FS.createReadStream book.path
    resolve rStream


module.exports =
  getAdapterId       : () -> ADAPTER_ID
  getBook            : getBook
  getBookForDownload : getBookForDownload
