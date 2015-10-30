var EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = createBasicEventuate

function createBasicEventuate (options) {
    options = typeof options === 'object' ? options : {}
    options.requireConsumption = options.requireConsumption === undefined ? false : options.requireConsumption
    options.destroyResidual = options.destroyResidual === undefined ? true :  options.destroyResidual

    var state = { isDestroyed: false, consumers: [] }

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
        if (data instanceof Error && eventuate._error) {
            data = eventuate._error(data)
            if (!(data instanceof Error)) return
        }
        else if (options.requireConsumption && state.consumers.length === 0)
            throw ((data instanceof Error) ? data : new EventuateUnconsumedError('Unconsumed eventuate data', data))

        for (var i = 0; i < state.consumers.length; i++) {
            state.consumers[i](data)
        }
    }

    function consume (consumer) {
        if (typeof consumer !== 'function') throw new TypeError('eventuate consumer must be a function')
        state.consumers.push(consumer)
    }

    function removeConsumer (consumer) {
        var consumerIdx = state.consumers.indexOf(consumer)
        if (consumerIdx === -1) return false
        state.consumers.splice(consumerIdx, 1)
        if (state.consumers.length === 0 && options.destroyResidual) eventuate.destroy()
        return true
    }

    function removeAllConsumers () {
        for (var i = state.consumers.length - 1; i >= 0; i--) eventuate.removeConsumer(state.consumers[i])
    }

    function getConsumers () {
        return state.consumers.slice()
    }

    function hasConsumer (consumer) {
        return consumer ? state.consumers.indexOf(consumer) > -1 : state.consumers.length > 0
    }

    function isDestroyed () {
        return state.isDestroyed
    }

    function destroy () {
        if (!state.isDestroyed && typeof eventuate._destroy === 'function') eventuate._destroy()
        state.isDestroyed = true
    }
}
