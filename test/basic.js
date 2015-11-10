var test      = require('tape'),
    eventuate = require('../basic')

test('basic eventuate', { timeout: 1000 }, function (t) {
    t.plan(6)

    var event = eventuate()
    t.equal(event.consumerAdded, undefined, 'consumerAdded should be undefined')
    t.equal(event.consumerRemoved, undefined, 'consumerRemoved should be undefined')

    var consumerCallCount = 0
    function consumer1 (value) {
        consumerCallCount++
        t.equal(value, 'test1', 'consumer1 should be passed value')
        t.equal(consumerCallCount, 1, 'consumer1 should be called once')
        event.removeConsumer(consumer1)
    }

    t.equal(typeof event(consumer1), 'function', '(consumer) should return eventuate')
    event.produce('test1')

    t.throws(event, 'consume requires a function')
})

test('basic eventuate hasConsumer() returns true for any consumer present', { timeout: 1000 }, function (t) {
    t.plan(2)

    var event = eventuate()
    t.equal(event.hasConsumer(), false, 'reports false with 0 consumers')

    event(function () {})
    t.equal(event.hasConsumer(), true, 'reports true with 1 consumers')
})

test('basic eventuate hasConsumer(consumer) returns boolean for specific consumer', { timeout: 1000 }, function (t) {
    t.plan(4)

    var event = eventuate()
    t.equal(event.hasConsumer(consumer1), false, 'hasConsumer(consumer1) = false')

    event(consumer1)
    t.equal(event.hasConsumer(consumer1), true, 'hasConsumer(consumer1) = true (after added)')
    t.equal(event.hasConsumer(consumer2), false, 'hasConsumer(consumer2) = false')

    event.removeConsumer(consumer1)
    t.equal(event.hasConsumer(consumer1), false, 'hasConsumer(consumer1) = false (after removed)')

    function consumer1 () {}
    function consumer2 () {}
})

test('basic eventuate removeConsumer returns boolean based on existance', { timeout: 1000 }, function (t) {
    t.plan(3)

    var event = eventuate()
    event(consumer1)

    t.ok(event.hasConsumer(), 'consumer1 added')
    t.equal(event.removeConsumer(consumer1), true, 'consumer1 removed')
    t.equal(event.removeConsumer(consumer1), false, 'consumer1 not removed')

    function consumer1 () {}
})
