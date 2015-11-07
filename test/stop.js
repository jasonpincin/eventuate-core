var test      = require('tape'),
    eventuate = require('..')

test('stop removes consumer that yielded it', { timeout: 1000 }, function (t) {
    t.plan(2)

    var event = eventuate()
    var handler = event.consume(consumer)
    t.ok(event.hasConsumer(consumer), 'consumer added')
    handler.stop()
    t.notOk(event.hasConsumer(consumer), 'stop removes consumer')

    function consumer () {}
})
