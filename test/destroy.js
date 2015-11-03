var test      = require('tape'),
    eventuate = require('..')

test('destroy is called when last consumer is removed', { timeout: 1000 }, function (t) {
    t.plan(1)

    var event         = eventuate()
    event(consumer1)
    event(consumer2)

    event.destroyed(function () {
        t.equal(event.isDestroyed(), true, 'destroy called')
    })
    event.removeAllConsumers()

    function consumer1 () {}
    function consumer2 () {}
})

test('destroy is NOT called when destroyResidual = false', { timeout: 1000 }, function (t) {
    t.plan(1)

    var event         = eventuate({ destroyResidual: false })
    event(consumer1)
    event(consumer2)

    event.destroyed(function () {
        t.fail('destroyed should not be called')
    })
    event.removeAllConsumers()

    t.equal(event.isDestroyed(), false, 'destroy not called')

    function consumer1 () {}
    function consumer2 () {}
})
