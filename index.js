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

  var consumers = [],
      destroyed = false,
      saturated = false

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
      for (var i = 0; i < _consumers.length; i++) {
        var consumer = _consumers[i]
        if (consumer.length > 1) {
          consumer.outstanding++
          if (!saturated && consumer.outstanding >= consumer.backpressure) {
            saturated = true
            eventuate.saturated.produce()
          }
          consumer(data, function done () {
            consumer.outstanding--
            if (saturated && !consumers.some(function (consumer) {
              return consumer.outstanding >= consumer.backpressure
            })) {
              saturated = false
              eventuate.unsaturated.produce()
            }
          })
        }
        else {
          consumer(data)
        }
      }
    }
  }

  function consume (consumer) {
    if (typeof consumer !== 'function')
      throw new TypeError('eventuate consumer must be a function')

    if (!destroyed) {
      consumer.outstanding = 0
      consumer.backpressure = typeof consumer.backpressure === 'number'
        ? consumer.backpressure
        : 10
      consumers.push(consumer)
      eventuate.consumerAdded.produce(consumer)
    }

    return eventuate
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
    return saturated
  }
}
