var assign = require('object-assign'),
    mixin  = require('./mixin')

module.exports = eventuateFactory
eventuateFactory.mixin = mixin

function eventuateFactory (options) {
  return mixin.call(assign(eventuate, mixin.properties, {
    factory: eventuateFactory
  }), options)

  function eventuate (consumer) {
    return eventuate.consume(consumer)
  }
}
