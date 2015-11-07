var test      = require('tape'),
    eventuate = require('..')

test('eventuate', { timeout: 1000 }, function (t) {
    t.plan(8)

    var event = eventuate()
    t.notOk(event.hasConsumer(), 'has no consumers initially')

    var consumerCallCount = 0
    function consumer1 (value) {
        consumerCallCount++
        t.equal(value, 'test1', 'consumer1 should be passed value')
        t.equal(consumerCallCount, 1, 'consumer1 should be called once')
        event.removeConsumer(consumer1)
    }

    t.equal(typeof event(consumer1), 'object', '(consumer) should return object')
    t.ok(event.hasConsumer(), 'has consumers after consumer added')
    event.produce('test1')
    t.notOk(event.hasConsumer(), 'has no consumers after consumer removed')

    t.throws(event, 'requires a consuming function')

    t.equal(event.factory, eventuate, 'exposes factory as .factory')
})
