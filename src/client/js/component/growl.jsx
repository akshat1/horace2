const React    = require('react');
const autobind = require('autobind-decorator');
const _        = require('lodash');
const PubSub   = require('./../util/pubsub.js');
const { Client: ClientEvents } = require('./../../../app/events.js');
const { Button, ButtonType }   = require('simian-react-button');

const StyleClass = {
  ROOT       : 'h-growl',
  ITEMROOT   : 'h-growl-item',
  MESSAGE    : 'h-growl-message',
  ITEMACTIVE : 'h-growl-item-active',
  ITEMCLOSEBUTTON: 'h-growl-item-close-button',

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


const DEFAULT_TIMEOUT  = 5000;
const ANIM_WAIT        = 5000;
const INFINITE_TIMEOUT = -1;


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

    if (timeout !== INFINITE_TIMEOUT) {
      this.hideTimeout = setTimeout(function() {
        this.hideItem(null, element);
      }.bind(this), timeout);
    }
  }


  @autobind
  hideItem(event, el) {
    if (this.hideTimeout)
      clearTimeout(this.hideTimeout);

    el = el || this.refs[RefName.ITEMROOT];
    if (el)
      el.classList.remove(StyleClass.ITEMACTIVE);
    this.mayHide = true;
  }


  @autobind
  handleTransitionEnd(evt) {
    if (!this.mayHide)
      return;

    let {
      id,
      onHide
    } = this.props;

    if (typeof onHide === 'function')
      onHide(id);
  }


  renderMessage() {
    let {
      message,
      onClick = _.noop
    } = this.props;
    if (typeof message === 'string')
      message = (
        <div className = {StyleClass.MESSAGE}>
          {message}
        </div>
      );

    return (
      <div className = {StyleClass.MESSAGE} onClick = {onClick}>
        {message}
      </div>
    );
  }


  renderCloseButton() {
    return (
      <Button
        type      = {ButtonType.CLOSE}
        className = {StyleClass.ITEMCLOSEBUTTON}
        onClick   = {this.hideItem}
      />
    );
  }


  render() {
    let className = `${StyleClass.ITEMROOT} ${StyleClass.ItemType[this.props.type]}`;

    return (
      <div className = {className} ref = {RefName.ITEMROOT}>
        {this.renderMessage()}
        {this.renderCloseButton()}
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
    if (payload.dispose)
      return this.disposeItem(payload.id);

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
    if (!id)
      throw new Error('id not specified to dispose growled item');
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


module.exports = {
  Growl,
  GrowlType
};
