var test      = require('tape'),
    eventuate = require('..')

test('errors propogated by default', { timeout: 1000 }, function (t) {
    t.plan(1)

    var event = eventuate()

    event(function (data) {
        t.ok(data instanceof Error, 'eventuate produced Error')
    })

    event.produce(new Error('boom'))
})

test('errors not propgated if .error has listener', { timeout: 1000 }, function (t) {
    t.plan(2)

    var event = eventuate()

    event(function (data) {
        t.notOk(data instanceof Error, 'eventuate did not produced Error')
    })

    event.error(function (err) {
        t.ok(err instanceof Error, 'eventuate.error produced Error')
    })

    event.produce(new Error('boom'))
    event.produce('data')
})

test('errors propgated after .error listener removed', { timeout: 1000 }, function (t) {
    t.plan(2)

    var event = eventuate()

    event(function (data) {
        t.ok(data instanceof Error, 'eventuate produced Error')
    })

    event.error(function (err) {
        t.ok(err instanceof Error, 'eventuate.error produced Error')
    })

    event.produce(new Error('boom'))
    event.error.removeAllConsumers()
    event.produce(new Error('boom'))
})
