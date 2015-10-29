var basicEventuate = require('./basic')

module.exports = createEventuate

function createEventuate (options) {
    var eventuate             = basicEventuate(options),
        basic                 = {
            consume       : eventuate.consume,
            removeConsumer: eventuate.removeConsumer,
            _destroy      : eventuate._destroy
        }

    eventuate.consume         = consume
    eventuate.removeConsumer  = removeConsumer
    eventuate._destroy        = _destroy
    eventuate.consumerAdded   = basicEventuate()
    eventuate.consumerRemoved = basicEventuate()
    eventuate.destroyed       = basicEventuate()
    eventuate.factory         = createEventuate

    return eventuate

    function consume (consumer) {
        basic.consume(consumer)
        eventuate.consumerAdded.produce(consumer)
    }

    function removeConsumer (consumer, options) {
        basic.removeConsumer(consumer, options)
        eventuate.consumerRemoved.produce(consumer)
    }

    function _destroy () {
        basic._destroy()
        eventuate.destroyed.produce()
    }
}
