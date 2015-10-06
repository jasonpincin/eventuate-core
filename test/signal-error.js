var test      = require('tape'),
    eventuate = require('..')

test('signal end', function (t) {
    t.plan(1)

    var error = new Error('smash')

    var event = eventuate()
    event.error(function (err) {
        t.equal(err, error, 'got error')
    })
    event.signalError(error)
})
