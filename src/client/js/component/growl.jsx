const React    = require('react');
const autobind = require('autobind-decorator');
const _        = require('lodash');
const PubSub   = require('./../util/pubsub.js');
const { Client: ClientEvents } = require('./../../../app/events.js');

const StyleClass = {
  ROOT       : 'h-growl',
  ITEMROOT   : 'h-growl-item',
  MESSAGE    : 'h-growl-message',
  ITEMACTIVE : 'h-growl-item-active',

  ItemType: {
    INFO  : 'h-growl-item-info',
    WARN  : 'h-growl-item-warn',
    ERROR : 'h-growl-item-error'
  }
};


const RefName = {
  ITEMROOT: 'h-growl-item'
};


const GrowlType = {
  INFO  : 'INFO',
  WARN  : 'WARN',
  ERROR : 'ERROR'
};


const DEFAULT_TIMEOUT = 5000;
const ANIM_WAIT       = 5000;


class GrowlItem extends React.Component {
  constructor(props) {
    super(props);
    this.handleTransitionEnd = _.debounce(this.handleTransitionEnd, 100);
  }


  /**
  - Wire onTransitionEnd
  - Remove active classname after timeout milis
  */
  @autobind
  componentDidMount() {
    let {
      timeout
    } = this.props;

    let element = this.refs[RefName.ITEMROOT];
    element.addEventListener('transitionend', this.handleTransitionEnd);

    setTimeout(function() {
      element.classList.add(StyleClass.ITEMACTIVE);
    }, 0);

    setTimeout(function() {
      element.classList.remove(StyleClass.ITEMACTIVE);
    }, timeout);
  }


  @autobind
  handleTransitionEnd(evt) {
    if (evt.target.classList.contains(StyleClass.ITEMACTIVE))
      return;
    let {
      id,
      onHide
    } = this.props;

    if (typeof onHide === 'function')
      onHide(id);
  }


  render() {
    let {
      onClick = _.noop,
      type
    } = this.props;
    let className = `${StyleClass.ITEMROOT} ${StyleClass.ItemType[type]}`;

    return (
      <div className = {className} ref = {RefName.ITEMROOT}>
        <div className = {StyleClass.MESSAGE} onClick = {onClick}>
          {props.message}
        </div>
      </div>
    );
  }
}




class Growl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.wirePubSub();
  }


  wirePubSub() {
    PubSub.subscribe(ClientEvents.GROWL, this.handleGrowl);
  }


  @autobind
  handleGrowl(payload) {
    let defaults = {
      id      : Date.now(),
      timeout : DEFAULT_TIMEOUT,
      type    : GrowlType.INFO
    };

    let itemModel = _.merge({}, defaults, payload);
    this.setState({
      items: [itemModel].concat(this.state.items)
    });
  }


  @autobind
  disposeItem(id) {
    let items = this.state.items.filter(function(i) {
      return i.id !== id;
    });

    this.setState({
      items
    });
  }


  renderItems() {
    let disposeItem = this.disposeItem;
    return this.state.items.map(function(itemModel) {
      let {
        id,
        message,
        type,
        timeout
      } = itemModel;

      return (
        <GrowlItem
          key     = {id}
          id      = {id}
          message = {message}
          type    = {type}
          timeout = {timeout}
          onHide  = {disposeItem}
        />
      );
    });
  }


  render() {
    return (
      <div className = 'h-growl'>
        {this.renderItems()}
      </div>
    );
  }
}


module.exports = Growl;
