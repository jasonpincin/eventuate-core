var test      = require('tape'),
    eventuate = require('..')

test('removeConsumer returns boolean based on existance', { timeout: 1000 }, function (t) {
    t.plan(3)

    var event = eventuate()
    event(consumer1)

    t.ok(event.hasConsumer(), 'consumer1 added')
    t.equal(event.removeConsumer(consumer1), true, 'consumer1 removed')
    t.equal(event.removeConsumer(consumer1), false, 'consumer1 not removed')

    function consumer1 () {}
})

test('consumer.removed called if present', { timeout: 1000 }, function (t) {
    t.plan(1)

    var event = eventuate()
    consumer.removed = function () {
        t.pass('consumer.removed called')
    }

    event(consumer)
    event.removeConsumer(consumer)

    function consumer () {}
})
