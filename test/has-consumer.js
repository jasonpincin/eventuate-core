var test      = require('tape'),
    eventuate = require('..')

test('hasConsumer() returns true for any consumer present', { timeout: 1000 }, function (t) {
    t.plan(2)

    var event = eventuate()
    t.equal(event.hasConsumer(), false, 'reports false with 0 consumers')

    event(function () {})
    t.equal(event.hasConsumer(), true, 'reports true with 1 consumers')
})

test('hasConsumer(consumer) returns boolean for specific consumer', { timeout: 1000 }, function (t) {
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
