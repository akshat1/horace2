# Requires exiftool to be installed
# http://www.sno.phy.queensu.ca/~phil/exiftool/install.html

$Path    = require 'path'
$FS      = require 'fs'
$Exec    = require('child_process').exec
$Winston = require 'winston'

$Book = require '../book.coffee'


ADAPTER_ID = 'horace.pdf'
CMD = 'exiftool'



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
    $Exec "#{CMD} -j '#{path}'", (err, stdOutBuff, stdErrBuff) ->
      if err
        reject err
      else
        if stdErrBuff
          reject stdErrBuff.toString()
        else
          resolve JSON.parse(stdOutBuff.toString())[0]
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
      reject new Error "horace.pdf: Not a pdf file (#{extension})."
    else
      getExif path
        .catch (err) -> reject err
        .then (exifdata) ->
          logger.info 'Got exif %o', exifdata
          try
          	book = new $Book path, getTitle(exifdata), getAuthors(exifdata), getSizeInBytes(exifdata), getYear(exifdata), getSubjects(exifdata), getPublisher(exifdata), ADAPTER_ID
          catch err1
            logger.error 'Error occurred: %o', err1
            reject err1
            return
          logger.debug 'resolve with: %o', book
          resolve book
  p




module.exports =
  getAdapterId: () -> ADAPTER_ID
  getBook : getBook
