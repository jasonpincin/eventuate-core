var assign       = require('object-assign'),
    Eventuate    = require('./constructor')

module.exports = eventuateFactory
eventuateFactory.constructor = Eventuate
eventuateFactory.isEventuate = Eventuate.isEventuate

function eventuateFactory (options) {
  Eventuate.call(assign(eventuate, Eventuate.prototype, {
    factory: eventuateFactory
  }), options)
  return eventuate

  function eventuate (consumer, errConsumer) {
    return eventuate.consume(consumer, errConsumer)
  }
}

