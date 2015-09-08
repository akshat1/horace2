###*
# @module txt adapter
###

$Path    = require 'path'
$FS      = require 'fs'
$Winston = require 'winston'
$Utils   = require '../utils.coffee'

$Book = require '../book.coffee'
$Formats = require '../formats.coffee'

ADAPTER_ID = 'horace.txt'
SUPPORTED_EXPORT_FORMATS = [$Formats.TXT]
DEFAULT_ENCODING = 'utf8'

GUTENBERG_LICENSE_TEXT = 'This eBook is for the use of anyone anywhere at no 
  cost and with almost no restrictions whatsoever.  You may copy it, give it 
  away or re-use it under the terms of the Project Gutenberg License included 
  with this eBook or online at www.gutenberg.net'


GUTENBERG_START_TAG = /\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*\s*.*\*\*\*/

GutenbergSearchPattern = 
  Title: /Title:[\s\S]*/
  Author: /Author:[\sS]*/

GutenbergReplacePattern =
  Title: /Title:\s*/
  Author: /Author:\s*/




logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: 'debug'
      }),
    new $Winston.transports.File({
      filename: $Path.join process.cwd(), 'horace-txt.log'
      })
  ]


getAdapterId = () -> ADAPTER_ID


getGutenbergInfoBlock = (text) ->
  sample = text.substr(0, 1500)
  match = sample.match GUTENBERG_START_TAG
  if match
    sample.substr 0, match.index

  else
    null


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
# @param {string} path - the path of the text file
# @param {string} text - the contents of the text file
# @returns {string} the title of the book
###
getTitle = (path, text) ->
  filename = $Path.basename path
  $Utils.toPromise filename


###*
# extract the authors of the given text file
# @param {string} text - the contents of the text file
# @returns {Array} - An array of author names (string)
###
getAuthors = (text) -> $Utils.toPromise ['Unknown']


###*
# find the size of the given text in bytes
# @param {string} path - the path of the file
# @returns {Promise}
# @resolves {Number} - the size of file in bytes
###
getSizeInBytes = (path) -> $Utils.toPromise -1


###*
# extract the year the given text was published
# @param {string} text - the contents of the text file
# @returns {Number} - the year
###
getYear = (text) -> $Utils.toPromise -1


###*
# extract the subjects of the given text file
# @param {string} text - the contents of the text file
# @returns {Array} - An array of subject names (string)
###
getSubjects = () -> $Utils.toPromise []


###*
# extract the publisher of the given text file
# @param {string} text - the contents of the text file
# @returns {String} - the publisher
###
getPublisher = () -> $Utils.toPromise 'Unknown'


# --------------------------------------------------------------------

getTitleForGutenberg = (tag) -> 
  tag.replace GutenbergReplacePattern.Title, ''
    .replace /\s+/, ' '


getAuthorsForGutenberg = (tag) -> 
  tag = tag.replace GutenbergReplacePattern.Author, ''
  tag.split '\n'
    .map (a) -> a.trim()


getYearForGutenberg = () -> $Utils.toPromise -1


getSubjectsForGutenberg = () -> $Utils.toPromise ['GBSubject']


getPublisherForGutenberg = () -> $Utils.toPromise 'GBPublisher'


getGutenbergBook = (path, infoBlock, text) ->
  new Promise (resolve, reject) ->
    title = null
    authors = []
    tags = infoBlock.split /\r\n\r\n/
    for tag, index in tags
      if GutenbergSearchPattern.Title.test tag
        title = getTitleForGutenberg tag

      else if GutenbergSearchPattern.Author.test tag
        authors = getAuthorsForGutenberg tag

    unless title
      throw new Error "Did not find title :( out of #{tags.length} tags (tags was #{typeof tags})\n\n#{JSON.stringify(tags)}"

    unless authors?.length
      authors = ['Unknown']
    
    Promise.all [getSizeInBytes(path),
      getYearForGutenberg(infoBlock),
      getSubjectsForGutenberg(infoBlock),
      getPublisherForGutenberg(infoBlock)]
      .then (infoArr) ->
        resolve new $Book path, title, authors, infoArr[2], infoArr[3], infoArr[4], infoArr[5], getAdapterId()

      .catch reject


getUnidentifiedBookInfo = (path, text) ->
  new Promise (resolve, reject) ->
    Promise.all [getTitle(path, text),
      getAuthors(text),
      getSizeInBytes(path),
      getYear(text),
      getSubjects(text),
      getPublisher(text)]
      .then (infoArr) ->
        console.log infoArr unless infoArr[0]
        #resolve new $Book path, infoArr[0], infoArr[1], infoArr[2], infoArr[3], infoArr[4], infoArr[5], getAdapterId()
        resolve()
      
      .catch reject


###*
# @param {string} path - path of the incoming file
# @returns {Promise}
# @resolves {Book}
###
getBook = (path) ->
  logger.info "TxtAdapter.getBook(#{path})"
  new Promise (resolve, reject) ->
    isTextFile path
      .then (isText) ->
        if isText
          logger.debug 'This is a text file'
          $FS.readFile path, (readErr, buff) ->
            if readErr
              reject readErr

            else
              text = buff.toString DEFAULT_ENCODING
              gutenbergInfo = getGutenbergInfoBlock text
              if gutenbergInfo
                console.log 'this is a guttenberg file'
                resolve getGutenbergBook path, gutenbergInfo, text

              else
                resolve getUnidentifiedBookInfo path, text

        else
          logger.debug 'not a text file'
          resolve()

      .catch (isTextFileErr) ->
        logger.error 'Error occurred while trying to find out if this a text file'
        reject isTextFileErr


###*
# @param {Book} book - The book to be downloaded
# @param {string} targetFormat - Which format the download is requested in
# @returns {Promise}
# @resolves {ReadStream}
###
getBookForDownload = (book, format = $Formats.TXT) ->
  new Promise (resolve, reject) ->
    if book.adapterId isnt getAdapterId()
      reject new Error "This book does not belong to this adapter [#{ADAPTER_ID}]"
      return

    unless format in SUPPORTED_EXPORT_FORMATS
      reject new Error "Target format not supported (>#{format}<)"
      return

    # ATM We know format is TXT
    rStream = $FS.createReadStream book.path
    resolve rStream




module.exports =
  # API
  getAdapterId       : getAdapterId
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
  getBookForDownload : getBookForDownload
