'use strict';

import Path from 'path';
import FS from 'fs';
import Winston from 'winston';
import Utils from '../utils.js';
import Book from '../book.js';
import Formats from '../formats.js';


const ADAPTER_ID = 'horace.txt';
const SUPPORTED_EXPORT_FORMATS = [Formats.TXT];
const DEFAULT_ENCODING = 'utf8';
const GUTENBERG_LICENSE_TEXT = 'This eBook is for the use of anyone anywhere at no cost and with almost no restrictions whatsoever.  You may copy it, give it away or re-use it under the terms of the Project Gutenberg License included with this eBook or online at www.gutenberg.net';
const GUTENBERG_START_TAG = /\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*\s*.*\*\*\*/;

const GutenbergSearchPattern = {
  Title  : /Title:[\s\S]*/,
  Author : /Author:[\sS]*/
};

const GutenbergReplacePattern = {
  Title  : /Title:\s*/,
  Author : /Author:\s*/
};


const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: 'warn'
    }), new Winston.transports.File({
      filename: Path.join(process.cwd(), 'horace-txt.log')
    })
  ]
});


export function getAdapterId() {
  return ADAPTER_ID;
}


function getGutenbergInfoBlock(text) {
  var sample = text.substr(0, 1500);
  var match = sample.match(GUTENBERG_START_TAG);
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

function isTextFile(path) {
  return new Promise(function(resolve, reject) {
    let isText = Path.extname(path).toLowerCase() === '.txt';
    if (!isText) {
      resolve(false);
    } else {
      FS.stat(path, function(statErr, stat) {
        if (statErr) {
          reject(statErr);
        } else {
          if (stat.isFile()) {
            return resolve(true);
          }
        }
      });//FS.stat
    }
  });//new Promise
};


/**
 * extract the title from the given text
 * @param {string} path - the path of the text file
 * @param {string} text - the contents of the text file
 * @returns {string} the title of the book
 */
function getTitle(path, text) {
  return Promise.resolve(Path.basename(path));
};


/**
 * extract the authors of the given text file
 * @param {string} text - the contents of the text file
 * @returns {Array} - An array of author names (string)
 */
function getAuthors(text) {
  return Promise.resolve(['Unknown']);
};


/**
 * find the size of the given text in bytes
 * @param {string} path - the path of the file
 * @returns {Promise}
 * @resolves {Number} - the size of file in bytes
 */
function getSizeInBytes(path) {
  return Promise.resolve(-1);
};


/**
 * extract the year the given text was published
 * @param {string} text - the contents of the text file
 * @returns {Number} - the year
 */
function getYear(text) {
  return Promise.resolve(-1);
};


/**
 * extract the subjects of the given text file
 * @param {string} text - the contents of the text file
 * @returns {Array} - An array of subject names (string)
 */
function getSubjects() {
  return Promise.resolve([]);
};


/**
 * extract the publisher of the given text file
 * @param {string} text - the contents of the text file
 * @returns {String} - the publisher
 */
function getPublisher() {
  return Promise.resolve('Unknown');
};


function getTitleForGutenberg(tag) {
  return tag.replace(GutenbergReplacePattern.Title, '').replace(/\s+/, ' ');
};


function getAuthorsForGutenberg(tag) {
  tag = tag.replace(GutenbergReplacePattern.Author, '');
  return tag.split('\n').map(function(a) {
    return a.trim();
  });
};


function getYearForGutenberg() {
  return Promise.resolve(-1);
};


function getSubjectsForGutenberg() {
  return Promise.resolve(['GBSubject']);
};


function getPublisherForGutenberg() {
  return Promise.resolve('GBPublisher');
};


function getGutenbergBook(path, infoBlock, text) {
  return new Promise(function(resolve, reject) {
    //var authors, i, index, len, tag, tags, title;
    let title = null;
    let authors = [];
    let tags = infoBlock.split(/\r\n\r\n/);
    for (let i = 0; i < tags.length; i++) {
      let tag = tags[i];
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
    return Promise.all([getSizeInBytes(path), getYearForGutenberg(infoBlock), getSubjectsForGutenberg(infoBlock), getPublisherForGutenberg(infoBlock)])
    .then(function(infoArr) {
      try {
        resolve(new Book(path, title, authors, infoArr[2], infoArr[3], infoArr[4], infoArr[5], getAdapterId()));
      } catch(err) {
        reject(err);
      }
    }).catch(reject);
  });//return new Promise
};


function getUnidentifiedBookInfo(path, text) {
  return new Promise(function(resolve, reject) {
    Promise.all([getTitle(path, text), getAuthors(text), getSizeInBytes(path), getYear(text), getSubjects(text), getPublisher(text)])
    .then(function(infoArr) {
      try {
        resolve(new Book(path, infoArr[0], infoArr[1], infoArr[2], infoArr[3], infoArr[4], infoArr[5], getAdapterId()));
      } catch(err) {
        reject(err);
      }
    })
    .catch(reject);
  });
};


/**
 * @param {string} path - path of the incoming file
 * @returns {Promise}
 * @resolves {Book}
 */
export function getBook(path) {
  logger.info("TxtAdapter.getBook(" + path + ")");
  return new Promise(function(resolve, reject) {
    isTextFile(path)
    .then(function(isText) {
      if (isText) {
        logger.debug('This is a text file');
        return FS.readFile(path, function(readErr, buff) {
          if (readErr) {
            console.error(`txt-adapter.getBook(${path}..readFile encountered error)`, readErr);
            reject(readErr);
          } else {
            let text = buff.toString(DEFAULT_ENCODING);
            let gutenbergInfo = getGutenbergInfoBlock(text);
            if (gutenbergInfo) {
              resolve(getGutenbergBook(path, gutenbergInfo, text));
            } else {
              logger.debug('This is a text file, but not from gutenberg');
              resolve(getUnidentifiedBookInfo(path, text));
            }
          }
        });
      } else {
        logger.debug('not a text file at all');
        resolve();
      }
    })//.then
    .catch(function(isTextFileErr) {
      logger.error('Error occurred while trying to find out if this a text file');
      reject(isTextFileErr);
    });//catch
  });//new Promise
};


/**
 * @param {Book} book - The book to be downloaded
 * @param {string} targetFormat - Which format the download is requested in
 * @returns {Promise}
 * @resolves {ReadStream}
 */
export function getBookForDownload(book, format) {
  if (format == null) {
    format = Formats.TXT;
  }
  return new Promise(function(resolve, reject) {
    var rStream;
    if (book.adapterId !== getAdapterId()) {
      reject(new Error("This book does not belong to this adapter [" + ADAPTER_ID + "]"));
      return;
    }
    if (SUPPORTED_EXPORT_FORMATS.indexOf(format) < 0) {
      reject(new Error("Target format not supported (>" + format + "<)"));
      return;
    }
    rStream = FS.createReadStream(book.path);
    return resolve(rStream);
  });
};
