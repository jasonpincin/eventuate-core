var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('consumption is endable', timeout, function (t) {
  t.plan(2)

  var event = eventuate()
  var consumption1 = event.consume(consumer1)

  t.equal(event.hasConsumer(), true)
  consumption1.end()
  t.equal(event.hasConsumer(), false)

  function consumer1 (data) {
  }
})

test('consumption obj isSaturated', timeout, function (t) {
  t.plan(6)

  var event = eventuate()
  var consumption1 = event.consume(consumer1)
  t.equal(consumption1.isSaturated(), false)
  t.equal(event.isSaturated(), false)
  consumption1.saturated()
  t.equal(consumption1.isSaturated(), true)
  t.equal(event.isSaturated(), true)
  consumption1.unsaturated()
  t.equal(consumption1.isSaturated(), false)
  t.equal(event.isSaturated(), false)

  function consumer1 (data) {
  }
})

test('then cb is called on end event', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  var c = event.consume(function () {})
  c.then(function () {
    t.ok(true)
  })
  event.destroy()
})
