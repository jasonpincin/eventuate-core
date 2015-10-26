var basicEventuate = require('./basic')

module.exports = createEventuate

function createEventuate (options) {
    var eventuate             = basicEventuate(options)
    eventuate.consume         = consume
    eventuate.removeConsumer  = removeConsumer
    eventuate.consumerAdded   = basicEventuate()
    eventuate.consumerRemoved = basicEventuate()
    eventuate.factory         = createEventuate

    return eventuate

    function consume (consumer) {
        if (typeof consumer !== 'function') throw new TypeError('eventuate consumer must be a function')
        eventuate._consumers.push(consumer)
        eventuate.consumerAdded.produce(consumer)
    }

    function removeConsumer (consumer) {
        eventuate._consumers.splice(eventuate._consumers.indexOf(consumer), 1)
        eventuate.consumerRemoved.produce(consumer)
    }
}
