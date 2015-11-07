var EventuateUnconsumedError = require('./errors').EventuateUnconsumedError,
    EventuateDestroyedError  = require('./errors').EventuateDestroyedError

module.exports = createBasicEventuate

function createBasicEventuate (options) {
    options = options || {}
    options.requireConsumption = options.requireConsumption !== undefined ? options.requireConsumption : false
    options.destroyResidual = options.destroyResidual !== undefined ? options.destroyResidual : false

    var destroyed = false,
        consumers = []

    eventuate.produce            = produce
    eventuate.consume            = consume
    eventuate.getConsumers       = getConsumers
    eventuate.hasConsumer        = hasConsumer
    eventuate.removeConsumer     = removeConsumer
    eventuate.removeAllConsumers = removeAllConsumers
    eventuate.destroy            = destroy
    eventuate.isDestroyed        = isDestroyed
    eventuate.factory            = createBasicEventuate
    eventuate.factory.basic      = createBasicEventuate

    return eventuate

    function eventuate (consumer) {
        return eventuate.consume(consumer)
    }

    function produce (data) {
        if (destroyed)
            throw new EventuateDestroyedError('Unable to produce from destroyed eventuate', data)
        else if (options.requireConsumption && consumers.length === 0)
            throw ((data instanceof Error) ? data : new EventuateUnconsumedError('Unconsumed eventuate data', data))
        else for (var i = 0; i < consumers.length; i++) {
            consumers[i](data)
        }
    }

    function consume (consumer) {
        if (typeof consumer !== 'function') throw new TypeError('eventuate consumer must be a function')
        if (!destroyed) consumers.push(consumer)
        return eventuate
    }

    function removeConsumer (consumer) {
        var consumerIdx = consumers.indexOf(consumer)
        if (consumerIdx === -1) return false
        consumers.splice(consumerIdx, 1)
        if (typeof consumer.removed === 'function') consumer.removed()
        if (consumers.length === 0 && options.destroyResidual) eventuate.destroy()
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

    function isDestroyed () {
        return destroyed
    }

    function destroy () {
        if (!destroyed) {
            destroyed = true
            eventuate.removeAllConsumers()
            return true
        }
        return false
    }
}
