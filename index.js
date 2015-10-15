var basicEventuate           = require('./basic'),
    EventuateUnconsumedError = require('./errors').EventuateUnconsumedError

module.exports = function createEventuate (options) {
    options = typeof options === 'object' ? options : {}
    options.requireConsumption = options.requireConsumption === undefined ? false : options.requireConsumption

    var eventuate = Object.defineProperties(basicEventuate(), {
        produce        : { value: produce, configurable: true, writable: true },
        consume        : { value: consume, configurable: true, writable: true },
        removeConsumer : { value: removeConsumer, configurable: true, writable: true },
        consumerAdded  : { value: basicEventuate(), configurable: true, writable: true },
        consumerRemoved: { value: basicEventuate(), configurable: true, writable: true },
        factory        : { value: createEventuate, configurable: true, writable: true }
    })

    return eventuate

    function produce (data) {
        if (options.requireConsumption && eventuate._consumers.length === 0)
            throw ((data instanceof Error) ? data : new EventuateUnconsumedError('Unconsumed eventuate data', { data: data }))

        eventuate._consumers.forEach(function eventuateConsume (consume) {
            consume(data)
        })
    }

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
