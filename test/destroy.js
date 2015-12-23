var test                    = require('tape'),
    eventuate               = require('..'),
    EventuateDestroyedError = require('../errors').EventuateDestroyedError,
    timeout                 = { timeout: 1000 }

test('destroyResidual destroys on last removeConsumer', timeout, function (t) {
  t.plan(1)

  var event = eventuate({ destroyResidual: true })
  event(consumer1)
  event(consumer2)

  event.on('destroy', function () {
    t.equal(event.isDestroyed(), true, 'destroy emitted')
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

  event.on('destroy', function () {
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

test('destroy emitted once', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  event.on('destroy', function () {
    t.pass('destroy emitted')
  })
  event.destroy()
  event.destroy()
  event.destroy()
})
