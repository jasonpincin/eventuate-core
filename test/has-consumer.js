var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('hasConsumer returns true if consumer present', timeout, function (t) {
  t.plan(2)

  var event = eventuate()
  t.equal(event.hasConsumer(), false, 'reports false with 0 consumers')

  event(function () {})
  t.equal(event.hasConsumer(), true, 'reports true with 1 consumers')
})

test('hasConsumer returns bool for consumer', timeout, function (t) {
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
