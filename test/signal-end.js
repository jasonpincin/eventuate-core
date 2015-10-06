var test      = require('tape'),
    eventuate = require('..')

test('signal end', function (t) {
    t.plan(1)

    var event = eventuate()
    event.end(function () {
        t.pass('got end')
    })
    event.signalEnd()
})
