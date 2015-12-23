var EventEmitter             = require('events').EventEmitter,
    assign                   = require('object-assign'),
    Consumption              = require('./lib/consumption'),
    EventuateDestroyedError  = require('./errors').EventuateDestroyedError,
    EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = Eventuate

function Eventuate (options) {
  options = assign({
    requireConsumption: false,
    destroyResidual   : false
  }, options)

  EventEmitter.call(this)
  this.setMaxListeners(Infinity)
  assign(this, {
    _options  : options,
    _destroyed: false,
    _saturated: false
  })
}
// inherits(Eventuate, EventEmitter)
assign(Eventuate.prototype, EventEmitter.prototype, {
  constructor         : Eventuate,
  on                  : on,
  addListener         : on,
  removeListener      : removeListener,
  removeAllListeners  : removeAllListeners,
  produce             : produce,
  produceError        : produceError,
  consume             : consume,
  hasConsumer         : hasConsumer,
  consumers           : consumers,
  removeConsumer      : removeConsumer,
  removeAllConsumers  : removeAllConsumers,
  destroy             : destroy,
  isDestroyed         : isDestroyed,
  isSaturated         : isSaturated,
  _consumerSaturated  : _consumerSaturated,
  _consumerUnsaturated: _consumerUnsaturated
})

function produce (data) {
  if (this._destroyed)
    throw new EventuateDestroyedError('unable to produce after destroy', data)
  if (this._options.requireConsumption && !this.hasConsumer())
    throw (data instanceof Error)
      ? data
      : new EventuateUnconsumedError('Unconsumed eventuate data', data)
  this.emit('data', data)
}

function produceError (err) {
  if (this._destroyed)
    throw new EventuateDestroyedError('unable to produce after destroy', err)
  this.emit('error', err)
}

function on (ev, cb) {
  var consumerAdded = (ev === 'data' && !this.hasConsumer(cb))
  var result = EventEmitter.prototype.on.call(this, ev, cb)
  if (consumerAdded)
    this.emit('consumerAdded', cb)
  return result
}

function removeListener (ev, cb) {
  var consumerRemoved = (ev === 'data' && this.hasConsumer(cb))
  var result = EventEmitter.prototype.removeListener.call(this, ev, cb)
  if (consumerRemoved) {
    this.emit('consumerRemoved', cb)
    if (this._options.destroyResidual && !this.hasConsumer())
      this.destroy()
  }
  return result
}

function removeAllListeners (ev) {
  if (ev === 'data') {
    var consumers = this.consumers()
    for (var i = 0; i < consumers.length; i++)
      this.removeConsumer(consumers[i])
  }
  else
    EventEmitter.prototype.removeAllListeners.call(this, ev)
  return this
}

function consume (consumer, errConsumer) {
  if (typeof consumer !== 'function')
    throw new TypeError('consumer must be a function')
  if (errConsumer && typeof errConsumer !== 'function')
    throw new TypeError('error consumer must be a function')

  this.on('data', consumer)
  if (errConsumer)
    this.on('error', errConsumer)
  this.on('removeListener', onListenerRemoved)

  var consumption = new Consumption(this, consumer, errConsumer)
  return consumption

  function onListenerRemoved (ev, removed) {
    if (ev === 'data' && removed === consumer) {
      if (errConsumer)
        this.removeListener('error', errConsumer)
      consumption.emit('end')
      this.removeListener('listenerRemoved', onListenerRemoved)
    }
    else if (ev === 'error' && errConsumer && removed === errConsumer) {
      this.removeConsumer(consumer)
    }
  }
}

function hasConsumer (consumer) {
  return consumer
    ? this.listeners('data').indexOf(consumer) > -1
    : this.listenerCount('data') > 0
}

function consumers () {
  return this.listeners('data')
}

function removeConsumer (consumer) {
  return this.removeListener('data', consumer)
}

function removeAllConsumers () {
  return this.removeAllListeners('data')
}

function destroy () {
  if (!this._destroyed) {
    this._destroyed = true
    this.emit('destroy')
  }
  return this
}

function isDestroyed () {
  return this._destroyed
}

function isSaturated () {
  return this._saturated
}

function _consumerSaturated (consumer) {
  if (!this._saturated) {
    this._saturated = true
    this.emit('saturated')
  }
}

function _consumerUnsaturated (consumer) {
  if (!this.consumers().some(filterSaturated)) {
    this._saturated = false
    this.emit('unsaturated')
  }
}

function filterSaturated (consumer) {
  return consumer._saturated
}
