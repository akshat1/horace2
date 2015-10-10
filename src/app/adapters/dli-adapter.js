'use strict';

import * as Path from 'path';
import * as FS from 'fs';
import * as Winston from 'winston';
import Book from './../book.js';

const DLI_MANIFEST_FILE = 'metadata.json';
const DLI_MANIFEST_FILE_OPTIONS = {
  encoding: 'utf8'
};
const ADAPTER_ID = 'horace.dli';
const Pattern = {
  author    : /author\d*/,
  subject   : /subject\d*/,
  publisher : /publisher\d*/
};


var logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: 'warn'
    }), new Winston.transports.File({
      filename: Path.join(process.cwd(), 'horace-dli-adapter.log')
    })
  ]
});


function getValuesForPattern (metadata, pattern) {
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


function getTitle(metadata) {
  return metadata.title;
};


function getAuthors(metadata) {
  return metadata.authors || getValuesForPattern(metadata, Pattern.author);
};


function getSizeInBytes(metadata) {
  return -1;
};


function getSubjects(metadata) {
  return metadata.subjects || getValuesForPattern(metadata, Pattern.subject);
};


function getPublisher(metadata) {
  return metadata.publisher;
};


function getYear(metadata) {
  return metadata.year;
};


export function getBook(path) {
  var p = new Promise(function(resolve, reject){
    let handleDLIManifest = function(manifestFileReadError, manifestFileContent) {
      if (manifestFileReadError) {
        logger.error(`dli.getBook(${path}.handleDLIManifest got statErr)`, manifestFileReadError);
        reject(manifestFileReadError);
      } else {
        let m = JSON.parse(manifestFileContent);
        let book = new Book(path, getTitle(m), getAuthors(m), getSizeInBytes(m), getYear(m), getSubjects(m), getPublisher(m), ADAPTER_ID);
        resolve(book);
      }
    }//handleDLIManifest

    let handleStat = function(statErr, stat) {
      logger.debug(`dli.getBook(${path}).handleStat`);
      if(statErr) {
        logger.error(`dli.getBook(${path}.handleStat got statErr)`, statErr);
        reject(statErr);
      } else {
        if (!stat.isDirectory()) {
          logger.debug(`dli.getBook(${path}).handleStat :: not a directory`);
          resolve(null);
        } else {
          let manifestFilePath = Path.join(path, DLI_MANIFEST_FILE);
          FS.exists(manifestFilePath, function(fileExists){
            if (fileExists) {
              logger.info(`dli.getBook(${path}).handleStat :: found manifest file`);
              FS.readFile(manifestFilePath, DLI_MANIFEST_FILE_OPTIONS, handleDLIManifest);
            } else {
              logger.debug(`dli.getBook(${path}).handleStat :: manifest file not found`);
              resolve(null);
            }
          });
        }
      }
    }//handleStat

    FS.stat(path, handleStat);
  });
  return p;
}//function getBook(path) {


export function getAdapterId() {
  return ADAPTER_ID;
}
