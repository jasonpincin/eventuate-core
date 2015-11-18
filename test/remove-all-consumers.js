var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('remove-all-consumers removes all consumers', timeout, function (t) {
  t.plan(3)

  var event = eventuate()
  event(consumer1)
  event(consumer2)
  event.consumerRemoved(function onConsumerRemoved (consumer) {
    t.ok(consumer === consumer1 || consumer === consumer2,
         'got consumerRemoved')
  })
  event.removeAllConsumers()
  t.equal(event.getConsumers().length, 0, 'no consumers remain')

  function consumer1 () {}
  function consumer2 () {}
})
