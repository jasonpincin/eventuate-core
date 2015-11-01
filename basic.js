var EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = createBasicEventuate

function createBasicEventuate (options) {
    options = typeof options === 'object' ? options : {}
    options.requireConsumption = options.requireConsumption === undefined ? false : options.requireConsumption
    options.destroyResidual = options.destroyResidual === undefined ? true :  options.destroyResidual

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

    return eventuate

    function eventuate (consumer) {
        eventuate.consume(consumer)
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
    }

    function removeConsumer (consumer) {
        var consumerIdx = consumers.indexOf(consumer)
        if (consumerIdx === -1) return false
        consumers.splice(consumerIdx, 1)
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
        if (!destroyed && typeof eventuate._destroy === 'function') eventuate._destroy()
        destroyed = true
    }
}
