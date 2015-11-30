var assign = require('object-assign'),
    mixin  = require('./mixin')

module.exports = createEventuate

function createEventuate (options) {
  return mixin.call(assign(eventuate, mixin.properties, {
    factory: createEventuate
  }), options)

  function eventuate (consumer) {
    return eventuate.consume(consumer)
  }
}
