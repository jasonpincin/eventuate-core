var EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = createBasicEventuate

function createBasicEventuate (options) {
    options = options || {}
    options.requireConsumption = options.requireConsumption !== undefined ? options.requireConsumption : false

    var consumers = []

    eventuate.produce            = produce
    eventuate.consume            = consume
    eventuate.getConsumers       = getConsumers
    eventuate.hasConsumer        = hasConsumer
    eventuate.removeConsumer     = removeConsumer
    eventuate.removeAllConsumers = removeAllConsumers
    eventuate.factory            = createBasicEventuate
    eventuate.factory.basic      = createBasicEventuate

    return eventuate

    function eventuate (consumer) {
        return eventuate.consume(consumer)
    }

    function produce (data) {
        if (options.requireConsumption && consumers.length === 0)
            throw ((data instanceof Error) ? data : new EventuateUnconsumedError('Unconsumed eventuate data', data))
        for (var i = 0; i < consumers.length; i++) {
            consumers[i](data)
        }
    }

    function consume (consumer) {
        if (typeof consumer !== 'function') throw new TypeError('eventuate consumer must be a function')
        consumers.push(consumer)
        return eventuate
    }

    function removeConsumer (consumer) {
        var consumerIdx = consumers.indexOf(consumer)
        if (consumerIdx === -1) return false
        consumers.splice(consumerIdx, 1)
        if (typeof consumer.removed === 'function') consumer.removed()
        return true
    }

    function removeAllConsumers () {
        for (var i = consumers.length - 1; i >= 0; i--) eventuate.removeConsumer(consumers[i])
    }

    function getConsumers () {
        return consumers.slice()
    }

    function hasConsumer (consumer) {
        return consumer ? consumers.indexOf(consumer) > -1 : consumers.length > 0
    }
}
