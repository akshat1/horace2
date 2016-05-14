'use strict';

const color = require('css-color-converter');

const Patterns = {
  Percentage : /.+%/,
  Number     : /\d+/
}


const lesser = (a, b) => a < b ? a : b;
const greater = (a, b) => a > b ? a : b;


function resolveFraction(frac) {
  if (Patterns.Percentage.test(frac)) {
    return parseFloat(frac) / 100;
  } else if (Patterns.Number.test(frac)) {
    return parseFloat(frac);
  } else
    throw new Error('Unknown fraction format: ', inp);
}


function getLightenComponentFunc(frac) {
  return function(c, index) {
    // We don't lighten alpha
    if (index === 3)
      return c;

    let delta = 255 - c;
    let bump = delta * frac;
    return lesser(c + bump, 255);
  }
}


function getDarkenComponentFunc(frac) {
  return function(c, index) {
    // We don't darken alpha
    if (index === 3)
      return c;

    let delta = c - 0;
    let bump = delta * frac;
    return greater(c - bump, 0);
  }
}


function lighten(value, frac){
  frac = resolveFraction(frac);
  let rgba = color(value).toRgbaArray();
  rgba = rgba.map(getLightenComponentFunc(frac));
  return color(rgba).toRgbString();
}


function darken(value, frac){
  frac = resolveFraction(frac);
  let rgba = color(value).toRgbaArray();
  rgba = rgba.map(getDarkenComponentFunc(frac));
  return color(rgba).toRgbString();
}


/**
Set new opacity regardless of what the original opacity was.
*/
function opacity(value, frac) {
  frac = resolveFraction(frac);
  let rgba = color(value).toRgbaArray();
  rgba[3] = frac;
  return color(rgba).toRgbString();
}


module.exports = {
  lighten : lighten,
  darken  : darken,
  opacity : opacity
};
