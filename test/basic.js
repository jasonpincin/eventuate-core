var test      = require('tape'),
    eventuate = require('../basic')

test('basic eventuate', function (t) {
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

    t.equal(typeof event(consumer1), 'undefined', '(consumer) should return undefined')
    event.produce('test1')

    t.throws(event, 'consume requires a function')
})
