var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('remove all data listeners = all consumers', timeout, function (t) {
  t.plan(3)

  var event = eventuate()
  event(consumer1, errHandler)
  event(consumer2, errHandler)
  event.on('consumerRemoved', function onConsumerRemoved (consumer) {
    t.ok(consumer === consumer1 || consumer === consumer2,
         'got consumerRemoved')
  })
  event.removeAllListeners('data')
  t.equal(event.consumers().length, 0, 'no consumers remain')

  function consumer1 () {}
  function consumer2 () {}
  function errHandler () {}
})

test('remove all error listeners leaves consumers', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  event(consumer1, errHandler1)
  event(consumer2, errHandler2)
  event.removeAllListeners('error')
  t.equal(event.consumers().length, 2, 'no consumers remain')

  function consumer1 () {}
  function consumer2 () {}
  function errHandler1 () {}
  function errHandler2 () {}
})
