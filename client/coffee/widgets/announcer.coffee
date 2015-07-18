$PubSub = require '../pubsub.coffee'
_ = require 'lodash'
$C = Compute

DEFAULT_TIMEOUT = 5000

class Announcer
  constructor: (params) ->
    window.__announcer = @
    @id = _.uniqueId 'announcer_'
    @key = ko.unwrap params.key
    @currentMessageB = $C.o ''
    @isVisibleB = $C.o false

    $PubSub.subscribe @key, @handleBroadcast


  getTimeoutDuration: (payload) -> if payload.hasOwnProperty 'timeout' then payload.timeout else DEFAULT_TIMEOUT


  handleBroadcast: (payload) =>
    clearTimeout(@deactivateKey) if @deactivateKey
    @currentMessageB payload.message
    @isVisibleB true
    timeoutDuration = @getTimeoutDuration payload
    @deactivateKey = setTimeout @deactivate, timeoutDuration unless timeoutDuration is -1


  deactivate: () =>
    clearTimeout(@deactivateKey) if @deactivateKey
    @isVisibleB false
    @currentMessageB ''




ko.components.register 'h-announcer',
  viewModel: Announcer
  template: """
      <div class='h-announcer-inner' data-bind='css: {"active": isVisibleB}'>
        <button class='h-announce-deactivate' data-bind='click: deactivate'></button>
        <span data-bind='html: currentMessageB'></span>
      </div>
    """