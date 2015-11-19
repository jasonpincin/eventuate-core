var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('supports backpressure (through saturation)', timeout, function (t) {
  t.plan(3)

  var event = eventuate()
  event.consume(consumer1)
  event.consume(consumer2)

  t.equal(event.isSaturated(), false)
  event.produce('test')
  t.equal(event.isSaturated(), true)
  event.unsaturated(function () {
    t.pass('got unsaturated event')
  })

  function consumer1 (data) {
    consumer1.saturated()
    setTimeout(function () {
      consumer1.unsaturated()
    }, 50)
  }
  function consumer2 (data) {
  }
})

test('default isSaturated always false', function (t) {
  t.plan(1)

  var event = eventuate()
  event.consume(consumer1)
  event.consume(consumer2)

  event.produce('test')
  t.equal(event.isSaturated(), false)

  function consumer1 (data) {
  }
  function consumer2 (data) {
  }
})

test('saturated production is bordered by unsaturated', timeout, function (t) {
  t.plan(2)

  var event            = eventuate(),
      saturatedCount   = 0,
      unsaturatedCount = 0,
      running          = 0
  event.consume(consumer1)

  event.saturated(function () {
    saturatedCount++
  })
  event.unsaturated(function () {
    unsaturatedCount++
  })
  event.produce('test')
  event.produce('test')
  event.produce('test')
  setTimeout(function () {
    t.equal(saturatedCount, 1)
    t.equal(unsaturatedCount, 1)
  }, 100)

  function consumer1 (data) {
    running++
    consumer1.saturated()
    setTimeout(function () {
      running--
      if (!running)
        consumer1.unsaturated()
    }, 50)
  }
})

test('all downstream consumers must be unsaturated', timeout, function (t) {
  t.plan(3)

  var event = eventuate()
  event.consume(consumer1)
  event.consume(consumer2)

  event.produce('test')
  t.ok(event.isSaturated(), 'saturated with 2/2 consumers saturated')
  setTimeout(function () {
    t.ok(event.isSaturated(), 'saturated with 1/2 consumers saturated')
  }, 75)
  setTimeout(function () {
    t.ok(!event.isSaturated(), 'unsaturated with 0/2 consumers saturated')
  }, 125)

  function consumer1 (data) {
    consumer1.saturated()
    setTimeout(function () {
      consumer1.unsaturated()
    }, 50)
  }
  function consumer2 (data) {
    consumer2.saturated()
    setTimeout(function () {
      consumer2.unsaturated()
    }, 100)
  }
})
