var EventEmitter = require('events').EventEmitter,
    assign       = require('object-assign')

module.exports = Consumption

function Consumption (eventuate, consumer, errConsumer) {
  EventEmitter.call(this)
  assign(this, {
    eventuate    : eventuate,
    consumer     : consumer,
    errorConsumer: errConsumer
  })
}
assign(Consumption.prototype, EventEmitter.prototype, {
  constructor: Consumption,
  end        : end,
  saturated  : saturated,
  unsaturated: unsaturated,
  isSaturated: isSaturated
})

function end () {
  this.eventuate.removeConsumer(this.consumer)
  return this
}

function saturated () {
  this.consumer._saturated = true
  this.eventuate._consumerSaturated(this.consumer)
  return this
}

function unsaturated () {
  this.consumer._saturated = false
  this.eventuate._consumerUnsaturated(this.consumer)
  return this
}

function isSaturated () {
  return !!this.consumer._saturated
}
