'use strict';

/**
 * General utilities
 * @module utils
 */
export function getHash(path) {
  var ch, hash, i, j, ref;
  if (!(path != null ? path.length : void 0)) {
    throw new Error('Missing argument to generate hash from');
  }
  for (i = j = 0, ref = path.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    ch = path.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  return hash;
}


/**
 * @param {Array} arr - Array of the objets to be processed
 * @param {function} fnGetter - function which returns a Promise which resolves, hopefully
                    in a value that satisifes fnCondition. Of the form (arr[i], i) ->
 * @param {function} fnCondition - function which returns a boolean, or a promise which
                    resolves in a boolean about the fitness of the result of fnGetter
 * @param {boolean} breakOnError - whether any errors will break all execution and cause
                   the returned promise to fail
 * @returns {Promise} - A promise which resolves in the value which satisfied fnCondition
 */
export function findPromise(arr, fnGetter, fnCondition, breakOnError) {
  return new Promise(function(resolve, reject) {
    var index, next, tick;
    index = 0;
    next = function() {
      index++;
      setTimeout(tick);
    };
    tick = function() {
      var candidate;
      if (index >= arr.length) {
        resolve(null);
        return;
      }
      candidate = arr[index];
      return fnGetter.call(null, candidate, index).then(function(obj) {
        return Promise.resolve(fnCondition.call(null, obj)).then(function(isValid) {
          if (isValid) {
            return obj;
          } else {
            return null;
          }
        });
      }).then(function(obj) {
        if (obj) {
          return resolve(obj);
        } else {
          return next();
        }
      }).catch(function(err) {
        console.error(`findPromise broke for the index ${index} which gave the candidate ${candidate.getAdapterId()}`);
        console.trace(err);
        if (breakOnError) {
          return reject(err);
        } else {
          return next();
        }
      });
    };
    return tick();
  });
}


/**
 * Execute fn on each item of arr in sequence. Expect promise from fn. Move to
 * i + 1 only when promise for i has resolved.
 * @param {Array} arr - Array of objects to be processed
 * @param {function} fn - A function of the form function(obj, index) which returns a promise
 * @param {boolean} breakOnError - Whether or not execution should stop when any promise rejects
 */
export function forEachPromise(arr, fn, breakOnError) {
  return new Promise(function(resolve, reject) {
    var index, next, result, tick;
    index = 0;
    result = [];
    next = function() {
      index++;
      return setTimeout(tick);
    };
    tick = function() {
      var candidate;
      if (index >= arr.length) {
        resolve(result);
        return;
      }
      candidate = arr[index];
      return fn(candidate, index).then(function(resultForIndex) {
        result.push(resultForIndex);
        return next();
      }).catch(function(err) {
        console.error(err);
        if (breakOnError) {
          return reject(err);
        } else {
          return next();
        }
      });
    };
    return tick();
  });
}
