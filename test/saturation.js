var test      = require('tape'),
    eventuate = require('..'),
    timeout   = { timeout: 1000 }

test('supports backpressure (through saturation)', timeout, function (t) {
  t.plan(3)

  var outstanding = []
  var event = eventuate()
  event.consume(consumer1)
  event.consume(consumer2)

  consumer1.isSaturated = function () {
    return outstanding.length
  }
  consumer2.isSaturated = function () {
    return false
  }

  t.equal(event.isSaturated(), false)
  event.produce('test')
  t.equal(event.isSaturated(), true)
  event.unsaturated(function () {
    t.pass('got unsaturated event')
  })

  function consumer1 (data, done) {
    outstanding.push(data)
    setTimeout(function () {
      outstanding = []
      done()
    }, 50)
  }
  function consumer2 (data, done) {
    done()
  }
})

test('default isSaturated always false', function (t) {
  t.plan(1)

  var event = eventuate()
  event.consume(consumer1)
  event.consume(consumer2)

  event.produce('test')
  t.equal(event.isSaturated(), false)

  function consumer1 (data, done) {
    done()
  }
  function consumer2 (data, done) {
    done()
  }
})
