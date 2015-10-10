/*
Will accept DLI books
@module DLI adapter
 */
var $Book, $FS, $Path, $Winston, ADAPTER_ID, DLI_MANIFEST_FILE, Pattern, getAuthors, getBook, getPublisher, getSizeInBytes, getSubjects, getTitle, getValuesForPattern, getYear, logger;

$Path = require('path');

$FS = require('fs');

$Winston = require('winston');

$Book = require('../book.js');

DLI_MANIFEST_FILE = 'metadata.json';

ADAPTER_ID = 'horace.dli';

Pattern = {
  author: /author\d*/,
  subject: /subject\d*/,
  publisher: /publisher\d*/
};

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: 'warn'
    }), new $Winston.transports.File({
      filename: $Path.join(process.cwd(), 'horace-dli-adapter.log')
    })
  ]
});

getValuesForPattern = function(metadata, pattern) {
  var key, value, values;
  values = {};
  for (key in metadata) {
    value = metadata[key];
    if (pattern.test(key) && value && typeof value === 'string' && value.toLowerCase() !== 'null') {
      values[value] = true;
    }
  }
  return Object.keys(values);
};

getTitle = function(metadata) {
  return metadata.title;
};

getAuthors = function(metadata) {
  return metadata.authors || getValuesForPattern(metadata, Pattern.author);
};

getSizeInBytes = function(metadata) {
  return -1;
};

getSubjects = function(metadata) {
  return metadata.subjects || getValuesForPattern(metadata, Pattern.subject);
};

getPublisher = function(metadata) {
  return metadata.publisher;
};

getYear = function(metadata) {
  return metadata.year;
};


/*
Will accept an absolute path which may refer to a file, or a directory.

@param path : String. Absolute path to the file / directory
@returns Promise. The promise will either
  resolve with a Book object if the adapter identifies the book
  or reject with error if any errors occurr or null if the books isnt identified.
 */

getBook = function(path) {
  var p;
  p = new Promise(function(resolve, reject) {
    var handleDLIManifest, handleStat;
    handleDLIManifest = function(manifestFileReadError, manifestFileContent) {
      var book, err, m;
      if (manifestFileReadError) {
        console.error('Manifest file read error', manifestFileReadError);
        return reject(manifestFileReadError);
      } else {
        m = JSON.parse(manifestFileContent);
        try {
          book = new $Book(path, getTitle(m), getAuthors(m), getSizeInBytes(m), getYear(m), getSubjects(m), getPublisher(m), ADAPTER_ID);
        } catch (_error) {
          err = _error;
          if (err) {
            console.error('DLI adapter encountered an error', err);
            reject(err);
            return;
          }
        }
        return resolve(book);
      }
    };
    handleStat = function(statError, stat) {
      var manifestFilePath;
      if (statError) {
        console.error('file stat error', statError);
        return reject(statError);
      } else if (!stat.isDirectory()) {
        logger.info('Not a directory');
        return resolve(null);
      } else {
        manifestFilePath = $Path.join(path, DLI_MANIFEST_FILE);
        return $FS.exists(manifestFilePath, function(fileExists) {
          if (fileExists) {
            logger.info('Found the manifest: ', manifestFilePath);
            return $FS.readFile(manifestFilePath, {
              encoding: 'utf8'
            }, handleDLIManifest);
          } else {
            logger.info('No manifest file. Return null');
            return resolve(null);
          }
        });
      }
    };
    return $FS.stat(path, handleStat);
  });
  return p;
};

module.exports = {
  getAdapterId: function() {
    return ADAPTER_ID;
  },
  getBook: getBook
};