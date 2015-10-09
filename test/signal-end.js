var test      = require('tape'),
    eventuate = require('..'),
    errors    = require('../errors')

test('signal end', function (t) {
    t.plan(2)

    var event = eventuate()
    event.end(function () {
        t.pass('got end')

        t.throws(event.produce, errors.EventuateEndedError, 'cannot produce data after signalEnd')
    })
    event.signalEnd()
})
