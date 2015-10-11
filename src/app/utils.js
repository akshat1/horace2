/**
 * General utilities
 * @module utils
 */
var conditionalRace, findPromise, forEachPromise, getHash, isPromise, testSequential, toPromise;

getHash = function(path) {
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
};


/**
 * @param {array} Array of Promises
 * @param {function} A function that accepts the result of each promise, and returns a boolean value.
 * @param {boolean} whether or not to break on error. default false (i.e. exceptions will be eaten)
 * @return {promise}
 * @resolve with the first value that satisfies the test condition, or null if no valid values are found
 * @reject rejects with the first error encountered iff breakOnError is true
 */

conditionalRace = function(promises, condition, breakOnError) {
  var pending, primary;
  if (!condition) {
    condition = function(x) {
      return x;
    };
  }
  pending = promises.length;
  primary = new Promise(function(resolve, reject) {
    var checkCompletion, index, j, len, p, results;
  checkCompletion = function() {
      if (pending === 0) {
        return resolve();
      }
    };
    results = [];
    for (index = j = 0, len = promises.length; j < len; index = ++j) {
      p = promises[index];
      p["catch"](function(err) {
        console.trace(err);
        pending--;
        if (breakOnError) {
          return reject(err);
        } else {
          return checkCompletion();
        }
      });
      results.push(p.then(function(result) {
        pending--;
        if (condition(result)) {
          return resolve(result);
        } else {
          return checkCompletion();
        }
      }));
    }
    return results;
  });
  return primary;
};


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

findPromise = function(arr, fnGetter, fnCondition, breakOnError) {
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
        return toPromise(fnCondition.call(null, obj)).then(function(isValid) {
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
      })["catch"](function(err) {
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
};


/**
 * Execute fn on each item of arr in sequence. Expect promise from fn. Move to 
 * i + 1 only when promise for i has resolved.
 * @param {Array} arr - Array of objects to be processed
 * @param {function} fn - A function of the form function(obj, index) which returns a promise
 * @param {boolean} breakOnError - Whether or not execution should stop when any promise rejects
 */

forEachPromise = function(arr, fn, breakOnError) {
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
      })["catch"](function(err) {
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
};


/**
 * Returns a boolean indidicating whether or not the param is a Promise
 * Uses instanceof
 * @param {object} x
 * @return {boolean} x instanceof Promise
 */

isPromise = function(x) {
  return x instanceof Promise;
};


/**
 * Returns a promise which resolves into the supplied argument.
 * Returns the argument as is when supplied with a promise.
 * @param x {object}
 * @returns {promise}
 */

toPromise = function(x) {
  if (isPromise(x)) {
    return x;
  } else {
    return new Promise(function(resolve, reject) {
      return resolve(x);
    });
  }
};

testSequential = function() {
  var arr, fn;
  arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  fn = function(x) {
    return new Promise(function(resolve, reject) {
      var inner;
      inner = function() {
        return resolve(x);
      };
      return setTimeout(inner, 1000);
    });
  };
  return forEachPromise(arr, fn);
};

module.exports = {
  getHash: getHash,
  conditionalRace: conditionalRace,
  isPromise: isPromise,
  toPromise: toPromise,
  findPromise: findPromise,
  forEachPromise: forEachPromise,
  testSequential: testSequential
};