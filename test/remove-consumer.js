var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('multiple removeConsumer emits 1 consumerRemoved', timeout, function (t) {
  t.plan(2)

  var event = eventuate()
  event(consumer1)
  event.on('consumerRemoved', function (consumer) {
    t.equal(consumer, consumer1, 'got consumerRemoved')
  })

  t.ok(event.hasConsumer(), 'consumer1 added')
  event.removeConsumer(consumer1)
  event.removeConsumer(consumer1)

  function consumer1 () {}
})

test('end emitted from consumption object', timeout, function (t) {
  t.plan(2)

  var event = eventuate()

  var consumption = event(consumer)
  consumption.once('end', function () {
    t.pass('end emitted on removeConsumer()')
  })
  event.removeConsumer(consumer)

  consumption = event(consumer)
  consumption.once('end', function () {
    t.pass('end emitted on end()')
  }).end()

  function consumer () {}
})
