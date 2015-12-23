var Eventuate    = require('./constructor'),
    assign       = require('object-assign')

module.exports = eventuateFactory
eventuateFactory.constructor = Eventuate

function eventuateFactory (options) {
  Eventuate.call(assign(eventuate, Eventuate.prototype, {
    factory: eventuateFactory
  }), options)
  return eventuate

  function eventuate (consumer, errConsumer) {
    return eventuate.consume(consumer, errConsumer)
  }
}

