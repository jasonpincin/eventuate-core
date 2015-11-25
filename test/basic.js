var test      = require('tape'),
    eventuate = require('../basic'),
    timeout   = { timeout: 1000 }

test('basic eventuate', timeout, function (t) {
  t.plan(6)

  var event = eventuate()
  t.equal(event.consumerAdded, undefined, 'consumerAdded === undefined')
  t.equal(event.consumerRemoved, undefined, 'consumerRemoved === undefined')

  var consumerCallCount = 0
  function consumer1 (value) {
    consumerCallCount++
    t.equal(value, 'test1', 'consumer1 should be passed value')
    t.equal(consumerCallCount, 1, 'consumer1 should be called once')
    event.removeConsumer(consumer1)
  }

  t.equal(typeof event(consumer1).end, 'function', 'returns consumption obj')
  event.produce('test1')

  t.throws(event, 'consume requires a function')
})

test('hasConsumer returns true if consumer present', timeout, function (t) {
  t.plan(2)

  var event = eventuate()
  t.equal(event.hasConsumer(), false, 'reports false with 0 consumers')

  event(function () {})
  t.equal(event.hasConsumer(), true, 'reports true with 1 consumers')
})

test('hasConsumer returns boolean for consumer', timeout, function (t) {
  t.plan(4)

  var event = eventuate()
  t.equal(event.hasConsumer(consumer1), false, 'hasConsumer(consumer1) = false')

  event(consumer1)
  t.equal(event.hasConsumer(consumer1), true, 'hasConsumer(consumer1) = true')
  t.equal(event.hasConsumer(consumer2), false, 'hasConsumer(consumer2) = false')

  event.removeConsumer(consumer1)
  t.equal(event.hasConsumer(consumer1), false, 'hasConsumer(consumer1) = false')

  function consumer1 () {}
  function consumer2 () {}
})

test('removeConsumer returns boolean', timeout, function (t) {
  t.plan(3)

  var event = eventuate()
  event(consumer1)

  t.ok(event.hasConsumer(), 'consumer1 added')
  t.equal(event.removeConsumer(consumer1), true, 'consumer1 removed')
  t.equal(event.removeConsumer(consumer1), false, 'consumer1 not removed')

  function consumer1 () {}
})

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
