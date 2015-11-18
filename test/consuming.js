var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('allows removal of consumer during produce', timeout, function (t) {
  t.plan(5)

  var event = eventuate()
  event.consume(consumer1)
  event.consume(consumer2)
  event.consume(consumer3)
  event.consume(consumer4)
  event.consume(consumer5)

  event.produce()

  t.ok(consumer1.called, 'consumer 1 called')
  t.ok(consumer2.called, 'consumer 2 called')
  t.ok(consumer3.called, 'consumer 3 called')
  t.ok(consumer4.called, 'consumer 4 called')
  t.ok(consumer5.called, 'consumer 5 called')

  function consumer1 () {
    consumer1.called = true
  }
  function consumer2 () {
    consumer2.called = true
    event.removeConsumer(consumer2)
  }
  function consumer3 () {
    consumer3.called = true
  }
  function consumer4 () {
    consumer4.called = true
  }
  function consumer5 () {
    consumer5.called = true
  }
})
