###*
# @module txt adapter
###

$Path    = require 'path'
$FS      = require 'fs'
$Winston = require 'winston'

$Book = require '../book.coffee'
$Formats = require '../formats.coffee'

ADAPTER_ID = 'horace.txt'
SUPPORTED_EXPORT_FORMATS = [$Formats.TXT]
DEFAULT_ENCODING = 'utf8'


logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: 'warn'
      }),
    new $Winston.transports.File({
      filename: $Path.join process.cwd(), 'horace-txt.log'
      })
  ]


###*
# @param {string} path
# @returns {Promise}
# @resolves {boolean} whether ot not path refers to a 'TEXT' && 'FILE'
###
isTextFile = (path) -> 
  new Promise (resolve, reject) ->
    isText = $Path.extname(path).toLowerCase() is '.txt'
    unless isText
      resolve false
      return

    $FS.stat path, (statErr, stat) ->
      if statErr
        reject statErr

      else
        if stat.isFile() 
          resolve true


###*
# extract the title from the given text
# @param {string} text - the contents of the text file
# @returns {string} the title of the book
###
getTitle = (fileName, text) -> 'Unknown'


###*
# extract the authors of the given text file
# @param {string} text - the contents of the text file
# @returns {Array} - An array of author names (string)
###
getAuthors = (text) -> ['Unknown']


###*
# find the size of the given text in bytes
# @param {string} path - the path of the file
# @returns {Promise}
# @resolves {Number} - the size of file in bytes
###
getSizeInBytes = (path) -> _.toPromise -1


###*
# extract the year the given text was published
# @param {string} text - the contents of the text file
# @returns {Number} - the year
###
getYear = (text) -> -1


###*
# extract the subjects of the given text file
# @param {string} text - the contents of the text file
# @returns {Array} - An array of subject names (string)
###
getSubjects = () -> []


###*
# extract the publisher of the given text file
# @param {string} text - the contents of the text file
# @returns {String} - the publisher
###
getPublisher = () -> 'Unknown'


###*
# @param {string} path - path of the incoming file
# @returns {Promise}
# @resolves {Book}
###
getBook = (path) ->
  new Promise (resolve, reject) ->
    isTextFile path
      .then (isText) ->
        if isText
          $FS.readFile path, (readErr, buff) ->
            if readErr
              reject readErr

            else
              getSizeInBytes path
                .then (sizeInBytes) ->
                  text        = buff.toString DEFAULT_ENCODING
                  title       = getTitle text
                  authors     = getAuthors text
                  year        = getYear text
                  subjects    = getSubjects text
                  publisher   = getPublisher text
                  adapterId   = getAdapterId()
                  resolve new $Book path, title, authors, sizeInBytes, year, subjects, publisher, adapterId

        else
          resolve()

      .catch reject    


###*
# @param {Book} book - The book to be downloaded
# @param {string} targetFormat - Which format the download is requested in
# @returns {Promise}
# @resolves {ReadStream}
###
getBookForDownload = (book, format = $Format.TXT) ->
  new Promise (resolve, reject) ->
    if book.adapterId isnt getAdapterId()
      reject new Error "This book does not belong to this adapter [#{ADAPTER_ID}]"
      return

    unless format in SUPPORTED_EXPORT_FORMATS
      reject new Error "Target format not supported (>#{targetFormat}<)"
      return

    # ATM We know format is TXT
    rStream = $FS.createReadStream book.path
    resolve rStream




module.exports =
  # API
  getAdapterId       : () -> ADAPTER_ID
  getBook            : getBook
  getBookForDownload : getBookForDownload

  # We need to export other functions as well to test them.
  isTextFile         : isTextFile
  getTitle           : getTitle
  getAuthors         : getAuthors
  getSizeInBytes     : getSizeInBytes
  getYear            : getYear
  getSubjects        : getSubjects
  getPublisher       : getPublisher
