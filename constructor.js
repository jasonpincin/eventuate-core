var assign = require('object-assign'),
    mixin  = require('./mixin')

module.exports = Eventuate

function Eventuate (options) {
  mixin.call(this, options)
}
assign(Eventuate.prototype, mixin.properties, {
  constructor: Eventuate
})
