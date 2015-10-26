var EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = createBasicEventuate

function createBasicEventuate (options) {
    options = typeof options === 'object' ? options : {}
    options.requireConsumption = options.requireConsumption === undefined ? false : options.requireConsumption

    eventuate.produce            = produce
    eventuate.consume            = consume
    eventuate.getConsumers       = getConsumers
    eventuate.hasConsumer        = hasConsumer
    eventuate.removeConsumer     = removeConsumer
    eventuate.removeAllConsumers = removeAllConsumers
    eventuate.factory            = createBasicEventuate
    eventuate._consumers         = []

    return eventuate

    function eventuate (consumer) {
        eventuate.consume(consumer)
    }

    function produce (data) {
        if (options.requireConsumption && eventuate._consumers.length === 0)
            throw ((data instanceof Error) ? data : new EventuateUnconsumedError('Unconsumed eventuate data', data))

        for (var i = 0; i < eventuate._consumers.length; i++) {
            eventuate._consumers[i](data)
        }
    }

    function consume (consumer) {
        if (typeof consumer !== 'function') throw new TypeError('eventuate consumer must be a function')
        eventuate._consumers.push(consumer)
    }

    function removeConsumer (consumer) {
        eventuate._consumers.splice(eventuate._consumers.indexOf(consumer), 1)
    }

    function removeAllConsumers () {
        for (var i = eventuate._consumers.length - 1; i >= 0; i--) eventuate.removeConsumer(eventuate._consumers[i])
    }

    function getConsumers () {
        return eventuate._consumers.slice()
    }

    function hasConsumer () {
        return eventuate._consumers.length > 0
    }
}
