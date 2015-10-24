var test      = require('tape'),
    eventuate = require('..'),
    errors    = require('../errors')

test('eventuate requiring consumption', { timeout: 1000 }, function (t) {
    t.plan(3)

    var error = eventuate({ requireConsumption: true })
    t.throws(function () {
        error.produce(new Error('no good'))
    }, 'throws on no consumers')
    t.throws(function () {
        error.produce('no good')
    }, 'does not require an error object')

    error(function (err) {
        t.equal(err.message, 'bad data', 'does not throw with cb consumer')
    })
    error.produce(new Error('bad data'))
})

test('EventuateUnconsumedError', function (t) {
    t.plan(3)

    var error = eventuate({ requireConsumption: true })
    try {
        error.produce('explode')
    }
    catch (err) {
        t.ok(err instanceof errors.EventuateUnconsumedError, 'err is instanceof EventuateUnconsumedError')
        t.equal(err.message, 'Unconsumed eventuate data', 'message is Unconsumed eventuate data')
        t.equal(err.data, 'explode', 'error.data is produced data')
    }
})
