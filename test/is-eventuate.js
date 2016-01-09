var test      = require('tape'),
    eventuate = require('..')

test('isEventuate should identify eventuates', { timeout: 1000 }, function (t) {
  t.plan(2)

  var event1 = eventuate()
  t.ok(eventuate.isEventuate(event1), 'is eventuate')
  t.ok(!eventuate.isEventuate({}), 'is not eventuate')
})
