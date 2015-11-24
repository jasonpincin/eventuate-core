var test                    = require('tape'),
    eventuate               = require('..'),
    EventuateDestroyedError = require('../errors').EventuateDestroyedError,
    timeout                 = { timeout: 1000 }

test('destroyResidual destroys on last removeConsumer', timeout, function (t) {
  t.plan(1)

  var event = eventuate({ destroyResidual: true })
  event(consumer1)
  event(consumer2)

  event.destroyed(function () {
    t.equal(event.isDestroyed(), true, 'destroy called')
  })
  event.removeAllConsumers()

  function consumer1 () {}
  function consumer2 () {}
})

test('!destroyResidual causes eventuate to persist', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  event(consumer1)
  event(consumer2)

  event.destroyed(function () {
    t.fail('destroyed should not be called')
  })
  event.removeAllConsumers()

  t.equal(event.isDestroyed(), false, 'destroy not called')

  function consumer1 () {}
  function consumer2 () {}
})

test('cannot produce after destroy', timeout, function (t) {
  t.plan(2)

  var event = eventuate()
  event.destroy()
  t.ok(event.isDestroyed())
  t.throws(function () {
    event.produce()
  }, EventuateDestroyedError)
})

test('consumer not added after destroy', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  event.destroy()
  event(function () {})
  t.notOk(event.hasConsumer(), 'consumer was not added')
})

test('2nd destroy call returns false', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  event.destroy()
  t.equal(event.destroy(), false)
})
