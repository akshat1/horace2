###
Will accept DLI books
###

$Path    = require 'path'
$FS      = require 'fs'
$Winston = require 'winston'

$Book    = require '../book.coffee'


DLI_MANIFEST_FILE = 'metadata.json'
ADAPTER_ID        = 'horace.dli'
Pattern =
  author    : /author\d*/
  subject   : /subject\d*/
  publisher : /publisher\d*/


logger = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: 'warn'
      }),
    new $Winston.transports.File({
      filename: $Path.join process.cwd(), 'horace-dli-adapter.log'
      })
  ]


getValuesForPattern = (metadata, pattern) ->
  values = {}
  for key, value of metadata
    #Someties they 'spell' a null out. Like 'null' 
    values[value] = true if pattern.test(key) and value and typeof value is 'string' and value.toLowerCase() isnt 'null'
  Object.keys values


getTitle = (metadata) -> metadata.title


getAuthors = (metadata) -> metadata.authors or getValuesForPattern metadata, Pattern.author


getSizeInBytes = (metadata) -> -1


getSubjects = (metadata) -> metadata.subjects or getValuesForPattern metadata, Pattern.subject


getPublishers = (metadata) -> metadata.publishers or getValuesForPattern metadata, Pattern.publisher


getYear = (metadata) -> metadata.year


###
Will accept an absolute path which may refer to a file, or a directory.

@param path : String. Absolute path to the file / directory
@returns Promise. The promise will either
  resolve with a Book object if the adapter identifies the book
  or reject with error if any errors occurr or null if the books isnt identified.
###
getBook = (path) ->
  p = new Promise (resolve, reject) ->
    handleDLIManifest = (manifestFileReadError, manifestFileContent) ->
      if manifestFileReadError
        console.error manifestFileReadError
        reject manifestFileReadError
      else
        m = JSON.parse manifestFileContent
        book = new $Book path, getTitle(m), getAuthors(m), getSizeInBytes(m), getYear(m), getSubjects(m), getPublishers(m), ADAPTER_ID
        resolve book

    handleStat = (statError, stat) ->
      if statError
        reject statError
      else if not stat.isDirectory()
        logger.warn 'Not a directory'
        reject null
      else
        manifestFilePath = $Path.join(path, DLI_MANIFEST_FILE)
        $FS.exists manifestFilePath, (fileExists) ->
          if fileExists
            logger.info 'Found the manifest: ', manifestFilePath
            $FS.readFile manifestFilePath, {encoding: 'utf8'}, handleDLIManifest
          else
            logger.warn 'No manifest file. Return null'
            reject null

    $FS.stat path, handleStat
  p




# --- --- --- EXPORTS --- --- --- #
module.exports =
  getAdapterId: () -> ADAPTER_ID
  getBook : getBook

