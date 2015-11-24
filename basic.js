module.exports = createBasicEventuate

function createBasicEventuate () {
  eventuate.produce        = produce
  eventuate.consume        = consume
  eventuate.hasConsumer    = hasConsumer
  eventuate.removeConsumer = removeConsumer
  eventuate.factory        = createBasicEventuate
  eventuate._consumers     = []

  return eventuate

  function eventuate (consumer) {
    return eventuate.consume(consumer)
  }
}

function produce (data) {
  for (var i = 0; i < this._consumers.length; i++) {
    this._consumers[i](data)
  }
}

function consume (consumer) {
  var self = this

  if (typeof consumer !== 'function')
    throw new TypeError('eventuate consumer must be a function')
  this._consumers.push(consumer)

  return {
    end: function endConsumption () {
      return self.removeConsumer(consumer)
    }
  }
}

function hasConsumer (consumer) {
  return consumer
    ? this._consumers.indexOf(consumer) > -1
    : this._consumers.length > 0
}

function removeConsumer (consumer) {
  var consumerIdx = this._consumers.indexOf(consumer)
  if (consumerIdx === -1) return false
  this._consumers.splice(consumerIdx, 1)
  return true
}
