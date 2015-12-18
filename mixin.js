var assign                   = require('object-assign'),
    basicEventuate           = require('basic-eventuate'),
    EventuateDestroyedError  = require('./errors').EventuateDestroyedError,
    EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = assign(function eventuate (options) {
  options = options || {}
  options.requireConsumption = options.requireConsumption !== undefined
    ? options.requireConsumption
    : false
  options.destroyResidual = options.destroyResidual !== undefined
    ? options.destroyResidual
    : false

  this.consumerAdded   = basicEventuate()
  this.consumerRemoved = basicEventuate()
  this.error           = basicEventuate()
  this.destroyed       = basicEventuate()
  this.saturated       = basicEventuate()
  this.unsaturated     = basicEventuate()
  this._consumers      = []
  this._options        = options
  this._destroyed      = false
  this._saturated      = false
  return this
}, { properties: {
  produce             : produce,
  consume             : consume,
  hasConsumer         : hasConsumer,
  getConsumers        : getConsumers,
  removeConsumer      : removeConsumer,
  removeAllConsumers  : removeAllConsumers,
  destroy             : destroy,
  isDestroyed         : isDestroyed,
  isSaturated         : isSaturated,
  _consumerSaturated  : _consumerSaturated,
  _consumerUnsaturated: _consumerUnsaturated
}})

function produce (data) {
  if (this._destroyed)
    throw new EventuateDestroyedError('Unable to produce after destroy', data)
  if (data instanceof Error && this.error.hasConsumer())
    this.error.produce(data)
  if (this._options.requireConsumption && this._consumers.length === 0)
    throw (data instanceof Error)
      ? data
      : new EventuateUnconsumedError('Unconsumed eventuate data', data)
  else {
    var consumers = this._consumers.slice()
    for (var i = 0; i < consumers.length; i++)
      consumers[i](data)
  }
}

function consume (consumer) {
  var self = this

  if (typeof consumer !== 'function')
    throw new TypeError('eventuate consumer must be a function')

  if (!this._destroyed) {
    consumer._saturated = false
    this._consumers.push(consumer)
    this.consumerAdded.produce(consumer)
  }

  // rewrite this as a constructor
  return {
    error: function error (consumr) {
      self.error.consume(consumer)
      return this
    },
    // is stop a better verb here?
    end: function end () {
      return self.removeConsumer(consumer)
    },
    then: function then (onDestroy) {
      // TODO: implement
      self.destroyed(onDestroy)
    },
    saturated: function consumptionSaturated () {
      consumer._saturated = true
      self._consumerSaturated(consumer)
    },
    unsaturated: function consumptionUnsaturated () {
      consumer._saturated = false
      self._consumerUnsaturated(consumer)
    },
    isSaturated: function consumptionSaturated () {
      return consumer._saturated
    }
  }
}

function hasConsumer (consumer) {
  return consumer
    ? this._consumers.indexOf(consumer) > -1
    : this._consumers.length > 0
}

function getConsumers () {
  return this._consumers.slice()
}

function removeConsumer (consumer) {
  var consumerIdx = this._consumers.indexOf(consumer)
  if (consumerIdx === -1) return false
  this._consumers.splice(consumerIdx, 1)
  this.consumerRemoved.produce(consumer)
  if (typeof consumer.removed === 'function') consumer.removed()
  if (!this._consumers.length && this._options.destroyResidual) this.destroy()
  return true
}

function removeAllConsumers () {
  var consumers = this.getConsumers()
  for (var i = this._consumers.length - 1; i >= 0; i--)
    this.removeConsumer(consumers[i])
}

function destroy () {
  if (!this._destroyed) {
    this._destroyed = true
    this.removeAllConsumers()
    this.destroyed.produce()
    return true
  }
  return false
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
    this.saturated.produce(consumer)
  }
}

function _consumerUnsaturated (consumer) {
  if (!this._consumers.some(filterSaturated)) {
    this._saturated = false
    this.unsaturated.produce(consumer)
  }
}

function filterSaturated (consumer) {
  return consumer._saturated
}
