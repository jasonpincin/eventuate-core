var test                    = require('tape'),
    eventuate               = require('..'),
    EventuateDestroyedError = require('../errors').EventuateDestroyedError,
    timeout                 = { timeout: 1000 }

test('errors propogated', timeout, function (t) {
  t.plan(1)

  var event = eventuate()

  event(function (data) {
    t.ok(data instanceof Error, 'eventuate produced Error')
  })

  event.produce(new Error('boom'))
})

test('produceError reaches errorConsumer only', timeout, function (t) {
  t.plan(2)

  var event = eventuate()

  event(function (data) {
    t.notOk(data instanceof Error, 'eventuate did not produced Error')
  }, function (err) {
    t.ok(err instanceof Error, 'eventuate.error produced Error')
  })

  event.produceError(new Error('boom'))
  event.produce('data')
})

test('errorConsumer removed by consumption end', timeout, function (t) {
  t.plan(5)

  var event = eventuate()

  var consumption = event(function (data) {
    t.notOk(data instanceof Error, 'eventuate produced data')
  }, function (err) {
    t.ok(err instanceof Error, 'eventuate.error produced Error')
  })

  event.produce('data')
  event.produceError(new Error('boom'))
  consumption.end()
  t.ok(!event.hasConsumer(), 'consumer gone')
  t.equal(event.listenerCount('error'), 0, 'errorConsumer gone')
  t.throws(function () {
    event.produceError(new Error('boom'))
  }, Error, 'throws after errorConsumer removed')
})

test('cannot produceError after destroyed', timeout, function (t) {
  t.plan(1)
  var event = eventuate()
  event.destroy()
  t.throws(function () {
    event.produceError(new Error('boom'))
  }, EventuateDestroyedError, 'throws EventuateDestroyedError')
})

test('produce string err with no errorConsumer throws', timeout, function (t) {
  t.plan(1)
  var event = eventuate()
  t.throws(function () {
    event.produceError('boom')
  }, Error, 'throws Error')
})

test('err thrown for invalid errConsumer', timeout, function (t) {
  t.plan(1)
  var event = eventuate()
  t.throws(function () {
    event.consume(function () {}, {})
  }, TypeError, 'throws')
})
