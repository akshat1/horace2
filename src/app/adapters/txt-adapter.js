/**
 * @module txt adapter
 */
var $Book, $FS, $Formats, $Path, $Utils, $Winston, ADAPTER_ID, DEFAULT_ENCODING, GUTENBERG_LICENSE_TEXT, GUTENBERG_START_TAG, GutenbergReplacePattern, GutenbergSearchPattern, SUPPORTED_EXPORT_FORMATS, getAdapterId, getAuthors, getAuthorsForGutenberg, getBook, getBookForDownload, getGutenbergBook, getGutenbergInfoBlock, getPublisher, getPublisherForGutenberg, getSizeInBytes, getSubjects, getSubjectsForGutenberg, getTitle, getTitleForGutenberg, getUnidentifiedBookInfo, getYear, getYearForGutenberg, isTextFile, logger,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$Path = require('path');

$FS = require('fs');

$Winston = require('winston');

$Utils = require('../utils.js');

$Book = require('../book.js');

$Formats = require('../formats.js');

ADAPTER_ID = 'horace.txt';

SUPPORTED_EXPORT_FORMATS = [$Formats.TXT];

DEFAULT_ENCODING = 'utf8';

GUTENBERG_LICENSE_TEXT = 'This eBook is for the use of anyone anywhere at no cost and with almost no restrictions whatsoever.  You may copy it, give it away or re-use it under the terms of the Project Gutenberg License included with this eBook or online at www.gutenberg.net';

GUTENBERG_START_TAG = /\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*\s*.*\*\*\*/;

GutenbergSearchPattern = {
  Title: /Title:[\s\S]*/,
  Author: /Author:[\sS]*/
};

GutenbergReplacePattern = {
  Title: /Title:\s*/,
  Author: /Author:\s*/
};

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: 'warn'
    }), new $Winston.transports.File({
      filename: $Path.join(process.cwd(), 'horace-txt.log')
    })
  ]
});

getAdapterId = function() {
  return ADAPTER_ID;
};

getGutenbergInfoBlock = function(text) {
  var match, sample;
  sample = text.substr(0, 1500);
  match = sample.match(GUTENBERG_START_TAG);
  if (match) {
    return sample.substr(0, match.index);
  } else {
    return null;
  }
};


/**
 * @param {string} path
 * @returns {Promise}
 * @resolves {boolean} whether ot not path refers to a 'TEXT' && 'FILE'
 */

isTextFile = function(path) {
  return new Promise(function(resolve, reject) {
    var isText;
    isText = $Path.extname(path).toLowerCase() === '.txt';
    if (!isText) {
      resolve(false);
      return;
    }
    return $FS.stat(path, function(statErr, stat) {
      if (statErr) {
        return reject(statErr);
      } else {
        if (stat.isFile()) {
          return resolve(true);
        }
      }
    });
  });
};


/**
 * extract the title from the given text
 * @param {string} path - the path of the text file
 * @param {string} text - the contents of the text file
 * @returns {string} the title of the book
 */

getTitle = function(path, text) {
  var filename;
  filename = $Path.basename(path);
  return $Utils.toPromise(filename);
};


/**
 * extract the authors of the given text file
 * @param {string} text - the contents of the text file
 * @returns {Array} - An array of author names (string)
 */

getAuthors = function(text) {
  return $Utils.toPromise(['Unknown']);
};


/**
 * find the size of the given text in bytes
 * @param {string} path - the path of the file
 * @returns {Promise}
 * @resolves {Number} - the size of file in bytes
 */

getSizeInBytes = function(path) {
  return $Utils.toPromise(-1);
};


/**
 * extract the year the given text was published
 * @param {string} text - the contents of the text file
 * @returns {Number} - the year
 */

getYear = function(text) {
  return $Utils.toPromise(-1);
};


/**
 * extract the subjects of the given text file
 * @param {string} text - the contents of the text file
 * @returns {Array} - An array of subject names (string)
 */

getSubjects = function() {
  return $Utils.toPromise([]);
};


/**
 * extract the publisher of the given text file
 * @param {string} text - the contents of the text file
 * @returns {String} - the publisher
 */

getPublisher = function() {
  return $Utils.toPromise('Unknown');
};

getTitleForGutenberg = function(tag) {
  return tag.replace(GutenbergReplacePattern.Title, '').replace(/\s+/, ' ');
};

getAuthorsForGutenberg = function(tag) {
  tag = tag.replace(GutenbergReplacePattern.Author, '');
  return tag.split('\n').map(function(a) {
    return a.trim();
  });
};

getYearForGutenberg = function() {
  return $Utils.toPromise(-1);
};

getSubjectsForGutenberg = function() {
  return $Utils.toPromise(['GBSubject']);
};

getPublisherForGutenberg = function() {
  return $Utils.toPromise('GBPublisher');
};

getGutenbergBook = function(path, infoBlock, text) {
  return new Promise(function(resolve, reject) {
    var authors, i, index, len, tag, tags, title;
    title = null;
    authors = [];
    tags = infoBlock.split(/\r\n\r\n/);
    for (index = i = 0, len = tags.length; i < len; index = ++i) {
      tag = tags[index];
      if (GutenbergSearchPattern.Title.test(tag)) {
        title = getTitleForGutenberg(tag);
      } else if (GutenbergSearchPattern.Author.test(tag)) {
        authors = getAuthorsForGutenberg(tag);
      }
    }
    if (!title) {
      throw new Error("Did not find title :( out of " + tags.length + " tags (tags was " + (typeof tags) + ")\n\n" + (JSON.stringify(tags)));
    }
    if (!(authors != null ? authors.length : void 0)) {
      authors = ['Unknown'];
    }
    return Promise.all([getSizeInBytes(path), getYearForGutenberg(infoBlock), getSubjectsForGutenberg(infoBlock), getPublisherForGutenberg(infoBlock)]).then(function(infoArr) {
      return resolve(new $Book(path, title, authors, infoArr[2], infoArr[3], infoArr[4], infoArr[5], getAdapterId()));
    })["catch"](reject);
  });
};

getUnidentifiedBookInfo = function(path, text) {
  return new Promise(function(resolve, reject) {
    return Promise.all([getTitle(path, text), getAuthors(text), getSizeInBytes(path), getYear(text), getSubjects(text), getPublisher(text)]).then(function(infoArr) {
      return resolve();
    })["catch"](reject);
  });
};


/**
 * @param {string} path - path of the incoming file
 * @returns {Promise}
 * @resolves {Book}
 */

getBook = function(path) {
  logger.info("TxtAdapter.getBook(" + path + ")");
  return new Promise(function(resolve, reject) {
    return isTextFile(path).then(function(isText) {
      if (isText) {
        logger.debug('This is a text file');
        return $FS.readFile(path, function(readErr, buff) {
          var gutenbergInfo, text;
          if (readErr) {
            return reject(readErr);
          } else {
            text = buff.toString(DEFAULT_ENCODING);
            gutenbergInfo = getGutenbergInfoBlock(text);
            if (gutenbergInfo) {
              return resolve(getGutenbergBook(path, gutenbergInfo, text));
            } else {
              return resolve(getUnidentifiedBookInfo(path, text));
            }
          }
        });
      } else {
        logger.debug('not a text file');
        return resolve();
      }
    })["catch"](function(isTextFileErr) {
      logger.error('Error occurred while trying to find out if this a text file');
      return reject(isTextFileErr);
    });
  });
};


/**
 * @param {Book} book - The book to be downloaded
 * @param {string} targetFormat - Which format the download is requested in
 * @returns {Promise}
 * @resolves {ReadStream}
 */

getBookForDownload = function(book, format) {
  if (format == null) {
    format = $Formats.TXT;
  }
  return new Promise(function(resolve, reject) {
    var rStream;
    if (book.adapterId !== getAdapterId()) {
      reject(new Error("This book does not belong to this adapter [" + ADAPTER_ID + "]"));
      return;
    }
    if (indexOf.call(SUPPORTED_EXPORT_FORMATS, format) < 0) {
      reject(new Error("Target format not supported (>" + format + "<)"));
      return;
    }
    rStream = $FS.createReadStream(book.path);
    return resolve(rStream);
  });
};

module.exports = {
  getAdapterId: getAdapterId,
  getBook: getBook,
  getBookForDownload: getBookForDownload,
  isTextFile: isTextFile,
  getTitle: getTitle,
  getAuthors: getAuthors,
  getSizeInBytes: getSizeInBytes,
  getYear: getYear,
  getSubjects: getSubjects,
  getPublisher: getPublisher,
  getBookForDownload: getBookForDownload
};