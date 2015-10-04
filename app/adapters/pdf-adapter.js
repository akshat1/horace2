/**
 * Requires exiftool to be installed
 * @see http://www.sno.phy.queensu.ca/~phil/exiftool/install.html
 * @module pdf adapter
 */
var $Book, $Exec, $FS, $Formats, $Path, $Winston, ADAPTER_ID, CMD, SUPPORTED_EXPORT_FORMATS, getAuthors, getBook, getBookForDownload, getExif, getPublisher, getSizeInBytes, getSubjects, getTitle, getYear, logger,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$Path = require('path');

$FS = require('fs');

$Exec = require('child_process').exec;

$Winston = require('winston');

$Book = require('../book.js');

$Formats = require('../formats.js');

ADAPTER_ID = 'horace.pdf';

CMD = 'exiftool';

SUPPORTED_EXPORT_FORMATS = [$Formats.PDF];

logger = new $Winston.Logger({
  transports: [
    new $Winston.transports.Console({
      level: 'warn'
    }), new $Winston.transports.File({
      filename: $Path.join(process.cwd(), 'horace-pdf-adapter.log')
    })
  ]
});

getExif = function(path) {
  var p;
  p = new Promise(function(resolve, reject) {
    var err;
    try {
      return $Exec(CMD + " -j \"" + path + "\" ", function(err, stdOutBuff, stdErrBuff) {
        var exifData;
        if (err) {
          return reject(err);
        } else {
          if (stdErrBuff) {
            return reject(stdErrBuff.toString());
          } else {
            exifData = JSON.parse(stdOutBuff.toString())[0];
            if (exifData) {
              return resolve(exifData);
            } else {
              return reject(new Error('Unknown error. No exifdata.'));
            }
          }
        }
      });
    } catch (_error) {
      err = _error;
      console.log('Error executing exiftool for path: ', path);
      console.trace(err);
      return reject(err);
    }
  });
  return p;
};

getTitle = function(exifdata) {
  return exifdata['Title'] || exifdata['FileName'];
};

getAuthors = function(exifdata) {
  return [exifdata['Author']];
};

getSizeInBytes = function(exifdata) {
  return -1;
};

getSubjects = function(exifdata) {
  return [exifdata['Subject']];
};

getPublisher = function() {
  return '';
};

getYear = function() {
  return -1;
};

getBook = function(path) {
  var fileName, p;
  logger.info("getBook(" + path + ")");
  fileName = $Path.basename(path);
  p = new Promise(function(resolve, reject) {
    var extension;
    extension = $Path.extname(path);
    if (extension.toLowerCase() !== '.pdf') {
      logger.info(path + " is not a pdf file.");
      return resolve(null);
    } else {
      return getExif(path)["catch"](function(err) {
        console.log('000000000000000000000000000000000000');
        return reject(err);
      }).then(function(exifdata) {
        var book, err1;
        logger.info('Got exif %o', exifdata);
        if (exifdata) {
          try {
            book = new $Book(path, getTitle(exifdata) || fileName, getAuthors(exifdata), getSizeInBytes(exifdata), getYear(exifdata), getSubjects(exifdata), getPublisher(exifdata), ADAPTER_ID);
          } catch (_error) {
            err1 = _error;
            logger.error('Error occurred: %o', err1);
            reject(err1);
            return;
          }
          logger.debug('resolve with: %o', book);
          return resolve(book);
        } else {
          logger.debug("No exifdata for " + path);
          return resolve();
        }
      });
    }
  });
  return p;
};

getBookForDownload = function(book, targetFormat) {
  if (targetFormat == null) {
    targetFormat = $Formats.PDF;
  }
  logger.info('getBookForDownload(%o)', book);
  return new Promise(function(resolve, reject) {
    var err, rStream;
    if (indexOf.call(SUPPORTED_EXPORT_FORMATS, targetFormat) < 0) {
      err = new Error("Target format not supported (>" + targetFormat + "<)");
      logger.error(err);
      reject(err);
      return;
    }
    logger.debug("create readstream for path: >" + book.path + "<");
    rStream = $FS.createReadStream(book.path);
    return resolve(rStream);
  });
};

module.exports = {
  getAdapterId: function() {
    return ADAPTER_ID;
  },
  getBook: getBook,
  getBookForDownload: getBookForDownload
};