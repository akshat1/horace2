'use strict';

const ID = {
  HORACE: 'master',
  SCANNER: 'worker.scanner'
};


const Config = {
  Master: {
    id     : ID.HORACE,
    silent : true,
    retry  : 1500
  },

  Worker: {
    id     : ID.SCANNER,
    silent : true,
    retry  : 1000
  }
};


module.exports = {
  ID,
  Config
}