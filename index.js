var basicEventuate = require('./basic')

module.exports = function createEventuate (options) {

    var eventuate = Object.defineProperties(basicEventuate(options), {
        consume        : { value: consume, configurable: true, writable: true },
        removeConsumer : { value: removeConsumer, configurable: true, writable: true },
        consumerAdded  : { value: basicEventuate(), configurable: true, writable: true },
        consumerRemoved: { value: basicEventuate(), configurable: true, writable: true },
        factory        : { value: createEventuate, configurable: true, writable: true }
    })

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
