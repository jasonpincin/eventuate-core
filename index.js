var basicEventuate           = require('./basic'),
    EventuateDestroyedError  = require('./errors').EventuateDestroyedError,
    EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = createEventuate

function createEventuate (options) {
  options = options || {}
  options.requireConsumption = options.requireConsumption !== undefined
    ? options.requireConsumption
    : false
  options.destroyResidual = options.destroyResidual !== undefined
    ? options.destroyResidual
    : false

  var consumers          = [],
      destroyed          = false,
      eventuateSaturated = false

  eventuate.consumerAdded      = basicEventuate()
  eventuate.consumerRemoved    = basicEventuate()
  eventuate.error              = basicEventuate()
  eventuate.destroyed          = basicEventuate()
  eventuate.saturated          = basicEventuate()
  eventuate.unsaturated        = basicEventuate()
  eventuate.produce            = produce
  eventuate.consume            = consume
  eventuate.hasConsumer        = hasConsumer
  eventuate.getConsumers       = getConsumers
  eventuate.removeConsumer     = removeConsumer
  eventuate.removeAllConsumers = removeAllConsumers
  eventuate.destroy            = destroy
  eventuate.isDestroyed        = isDestroyed
  eventuate.isSaturated        = isSaturated
  eventuate.factory            = createEventuate

  return eventuate

  function eventuate (consumer) {
    return eventuate.consume(consumer)
  }

  function produce (data) {
    if (destroyed)
      throw new EventuateDestroyedError('Unable to produce after destroy', data)
    if (options.requireConsumption && consumers.length === 0)
      throw (data instanceof Error)
        ? data
        : new EventuateUnconsumedError('Unconsumed eventuate data', data)
    if (data instanceof Error && eventuate.error.hasConsumer())
      eventuate.error.produce(data)
    else {
      var _consumers = consumers.slice()
      for (var i = 0; i < _consumers.length; i++)
        _consumers[i](data)
    }
  }

  function consume (consumer) {
    if (typeof consumer !== 'function')
      throw new TypeError('eventuate consumer must be a function')

    var saturated = false

    if (!destroyed) {
      consumer.saturated = consumerSaturated
      consumer.unsaturated = consumerUnsaturated
      consumer.isSaturated = consumerIsSaturated
      consumers.push(consumer)
      eventuate.consumerAdded.produce(consumer)
    }

    return eventuate

    function consumerSaturated () {
      saturated = true
      if (!eventuateSaturated) {
        eventuateSaturated = true
        eventuate.saturated.produce()
      }
    }

    function consumerUnsaturated () {
      saturated = false
      if (!consumers.some(filterSaturated)) {
        eventuateSaturated = false
        eventuate.unsaturated.produce()
      }
    }

    function consumerIsSaturated () {
      return saturated
    }
  }

  function hasConsumer (consumer) {
    return consumer ? consumers.indexOf(consumer) > -1 : consumers.length > 0
  }

  function getConsumers () {
    return consumers.slice()
  }

  function removeConsumer (consumer) {
    var consumerIdx = consumers.indexOf(consumer)
    if (consumerIdx === -1) return false
    consumers.splice(consumerIdx, 1)
    eventuate.consumerRemoved.produce(consumer)
    if (typeof consumer.removed === 'function') consumer.removed()
    if (!consumers.length && options.destroyResidual) eventuate.destroy()
    return true
  }

  function removeAllConsumers () {
    var consumers = eventuate.getConsumers()
    for (var i = consumers.length - 1; i >= 0; i--)
      eventuate.removeConsumer(consumers[i])
  }

  function destroy () {
    if (!destroyed) {
      destroyed = true
      eventuate.removeAllConsumers()
      eventuate.destroyed.produce()
      return true
    }
    return false
  }

  function isDestroyed () {
    return destroyed
  }

  function isSaturated () {
    return eventuateSaturated
  }

  function filterSaturated (consumer) {
    return consumer.isSaturated()
  }
}
