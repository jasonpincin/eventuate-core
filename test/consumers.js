var test      = require('tape'),
    eventuate = require('..')

test('getConsumers', { timeout: 1000 }, function (t) {
    t.plan(3)

    function consumer1 () {}
    function consumer2 () {}

    var event = eventuate()
    event(consumer1)
    event(consumer2)

    t.equals(event.getConsumers()[0], consumer1, 'should return a shallow copy')
    t.equals(event.getConsumers().length, 2, 'should contain 2 functions')
    event.getConsumers().splice(0, 1)
    t.equals(event.getConsumers().length, 2, 'should be unalterable')
})
