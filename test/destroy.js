var test      = require('tape'),
    eventuate = require('..')

test('_destroy is called when last consumer is removed', { timeout: 1000 }, function (t) {
    t.plan(1)

    var event         = eventuate(),
        destroyCalled = 0

    event(consumer1)
    event(consumer2)

    event._destroy = function () {
        destroyCalled++
    }
    event.destroyed(function () {
        t.equal(destroyCalled, 1, 'destroy called 1 time before destroyed')
    })
    event.removeAllConsumers()

    function consumer1 () {}
    function consumer2 () {}
})

test('_destroy is NOT called when destroyResidual = false', { timeout: 1000 }, function (t) {
    t.plan(1)

    var event         = eventuate({ destroyResidual: false }),
        destroyCalled = 0

    event(consumer1)
    event(consumer2)

    event._destroy = function () {
        destroyCalled++
    }
    event.destroyed(function () {
        t.fail('destroyed should not be called')
    })
    event.removeAllConsumers()

    t.equal(destroyCalled, 0, 'destroy/destroyed not called')

    function consumer1 () {}
    function consumer2 () {}
})
