var $C, $PubSub, Announcer, DEFAULT_TIMEOUT, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$PubSub = require('../pubsub.js');

_ = require('lodash');

$C = Compute;

DEFAULT_TIMEOUT = 5000;

Announcer = (function() {
  function Announcer(params) {
    this.deactivate = bind(this.deactivate, this);
    this.handleBroadcast = bind(this.handleBroadcast, this);
    window.__announcer = this;
    this.id = _.uniqueId('announcer_');
    this.key = ko.unwrap(params.key);
    this.currentMessageB = $C.o('');
    this.isVisibleB = $C.o(false);
    $PubSub.subscribe(this.key, this.handleBroadcast);
  }

  Announcer.prototype.getTimeoutDuration = function(payload) {
    if (payload.hasOwnProperty('timeout')) {
      return payload.timeout;
    } else {
      return DEFAULT_TIMEOUT;
    }
  };

  Announcer.prototype.handleBroadcast = function(payload) {
    var timeoutDuration;
    if (this.deactivateKey) {
      clearTimeout(this.deactivateKey);
    }
    this.currentMessageB(payload.message);
    this.isVisibleB(true);
    timeoutDuration = this.getTimeoutDuration(payload);
    if (timeoutDuration !== -1) {
      return this.deactivateKey = setTimeout(this.deactivate, timeoutDuration);
    }
  };

  Announcer.prototype.deactivate = function() {
    if (this.deactivateKey) {
      clearTimeout(this.deactivateKey);
    }
    this.isVisibleB(false);
    return this.currentMessageB('');
  };

  return Announcer;

})();

ko.components.register('h-announcer', {
  viewModel: Announcer,
  template: "<div class='h-announcer-inner' data-bind='css: {\"active\": isVisibleB}'>\n  <button class='h-announce-deactivate' data-bind='click: deactivate'></button>\n  <span data-bind='html: currentMessageB'></span>\n</div>"
});
