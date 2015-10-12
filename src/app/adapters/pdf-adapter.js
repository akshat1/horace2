/**
 * Requires exiftool to be installed
 * @see http://www.sno.phy.queensu.ca/~phil/exiftool/install.html
 * @module pdf adapter
 */

import Path from 'path';
import FS from 'fs';
import ChildProcess from 'child_process';
import Winston from 'winston';

import Book from '../book.js'
import Formats from '../formats.js';

const Exec = ChildProcess.exec;
const ADAPTER_ID = 'horace.pdf';
const CMD = 'exiftool';
const SUPPORTED_EXPORT_FORMATS = [Formats.PDF];

const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: 'warn'
    }), new Winston.transports.File({
      filename: Path.join(process.cwd(), 'horace-pdf-adapter.log')
    })
  ]
});


function getExif(path) {
  logger.debug(`pdf.getExif(${path})`);
  return new Promise(function(resolve, reject){
    let command = `${CMD} -j "${path}"`;
    logger.debug(`pdf.getExif(${path}). Executing ${command}`);
    Exec(command, function(exifErr, stdOutBuff, stdErrBuff) {
      if(exifErr){
        logger.error(`pdf.getExif(${path}).execCallback encountered error`, exifErr);
        reject(exifErr);
      } else {
        if (stdErrBuff) {
          let errString = stdErrBuff.toString();
          logger.error(`pdf.getExif(${path}).execCallback there is something in stdErr: ${errString}`);
          reject(errString);
        } else {
          logger.debug(`pdf.getExif(${path}).execCallback everything seems to be in order`);
          let exifData = JSON.parse(stdOutBuff.toString())[0];
          if (exifData) {
            resolve(exifData);
          } else {
            logger.error(`pdf.getExif(${path}).execCallback did not obtain exif`);
            reject(new Error('Unknown error. No exifdata.'));
          }
        }
      }
    });//$Exec(CMD + " -j \"" + path + "\" ", function(exifErr, stdOutBuff, stdErrBuff)
  });//return new Promise(function(resolve, reject)
}


function getTitle(exifdata) {
  return exifdata['Title'] || exifdata['FileName'];
};

function getAuthors(exifdata) {
  return [exifdata['Author']];
};

function getSizeInBytes(exifdata) {
  return -1;
};

function getSubjects(exifdata) {
  return [exifdata['Subject']];
};

function getPublisher() {
  return '';
};

function getYear() {
  return -1;
}


export function getAdapterId() {
  return ADAPTER_ID;
}


export function getBookForDownload(book, targetFormat) {
  targetFormat = targetFormat || Formats.PDF;
  logger.info('getBookForDownload(%o)', book);
  return new Promise(function(resolve, reject) {
    if (indexOf.call(SUPPORTED_EXPORT_FORMATS, targetFormat) < 0) {
      let err = new Error("Target format not supported (>" + targetFormat + "<)");
      logger.error(err);
      reject(err);
      return;
    }
    logger.debug("create readstream for path: >" + book.path + "<");
    let rStream = FS.createReadStream(book.path);
    return resolve(rStream);
  });
};


export function getBook(path) {
  logger.info(`getBook(${path})`);
  var fileName = Path.basename(path);
  return new Promise(function(resolve, reject) {
    let extension = Path.extname(path);
    if (extension.toLowerCase() !== '.pdf') {
      logger.info(`${path} is not a pdf file.`);
      resolve(null);
    } else {
      getExif(path)
      .then(function(exifdata) {
        if (exifdata) {
          logger.info(`getBook(${path}) :: got exifdata. try resolving with book`);
          try {
            resolve(new Book(path, getTitle(exifdata) || fileName, getAuthors(exifdata), getSizeInBytes(exifdata), getYear(exifdata), getSubjects(exifdata), getPublisher(exifdata), ADAPTER_ID));
          } catch(err) {
            reject(err);
          }
        } else {
          logger.info(`getBook(${path}) :: no exifdata`);
          resolve();
        }
      })
      .catch(function(err) {
        return reject(err);
      });
    }
  });
};
