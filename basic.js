module.exports = function createBasicEventuate () {
    Object.defineProperties(eventuate, {
        consumers         : { get: getConsumers, enumerable: true, configurable: true },
        hasConsumer       : { get: getHasConsumer, enumerable: true, configurable: true },
        produce           : { value: produce, configurable: true, writable: true },
        consume           : { value: consume, configurable: true, writable: true },
        removeConsumer    : { value: removeConsumer, configurable: true, writable: true },
        removeAllConsumers: { value: removeAllConsumers, configurable: true, writable: true },
        factory           : { value: createBasicEventuate, configurable: true, writable: true },

        _consumers: { value: [] }
    })

    return eventuate

    function eventuate (consumer) {
        eventuate.consume(consumer)
    }

    function produce (data) {
        eventuate._consumers.forEach(function eachConsumer (consumer) {
            consumer(data)
        })
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

    function getHasConsumer () {
        return eventuate._consumers.length > 0
    }
}
