###
Will accept DLI books
###

$Path = require 'path'
$FS   = require 'fs'
$Book = require '../book.coffee'

DLI_MANIFEST_FILE = 'metadata.json'
ADAPTER_ID = 'horace.dli'


Pattern =
  author    : /author\d*/
  subject   : /subject\d*/
  publisher : /publisher\d*/


getValuesForPattern = (metadata, pattern) ->
  values = {}
  for key, value of metadata
    #Someties they 'spell' a null out. Like 'null' 
    values[value] = true if pattern.test(key) and value and typeof value is 'string' and value.toLowerCase() isnt 'null'
  Object.keys values


getTitle = (metadata) -> metadata.title


getAuthors = (metadata) -> getValuesForPattern metadata, Pattern.author


getSizeInBytes = (metadata) -> -1


getSubjects = (metadata) -> getValuesForPattern metadata, Pattern.subject


getPublishers = (metadata) -> getValuesForPattern metadata, Pattern.publisher


###
Will accept an absolute path which may refer to a file, or a directory.

@param path : String. Absolute path to the file / directory
@returns Promise. The promise will either
  resolve with 
    - a Book object if the adapter identifies the book
    - null if the adapter does not identify the book
  or reject with error if any errors occurr
###
getBook = (path) ->
  p = new Promise (resolve, reject) ->
    handleDLIManifest = (manifestFileReadError, manifestFileContent) ->
      if manifestFileReadError
        console.error manifestFileReadError
        reject manifestFileReadError
      else
        m = JSON.parse manifestFileContent
        book = new $Book path, getTitle(m), getAuthors(m), getSizeInBytes(m), getSubjects(m), getPublishers(m), ADAPTER_ID
        resolve book

    handleFileList = (fileListError, fileNames)->
      if fileListError
        reject fileListError
      else
        for fName in fileNames
          if fName is DLI_MANIFEST_FILE
            # Found dli metadata file. handle it.
            $FS.readFile $Path.join(path, fName), {encoding: 'utf8'}, handleDLIManifest
            break
        # We did not find the dli metadata file. return
        resolve null

    handleStat = (statError, stat) ->
      if statError
        reject statError
      else if not stat.isDirectory()
        resolve null
      else
        $FS.readdir path, handleFileList

    $FS.stat path, handleStat
  p




# --- --- --- EXPORTS --- --- --- #
module.exports =
  getAdapterId: () -> ADAPTER_ID
  getBook : getBook

