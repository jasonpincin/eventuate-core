var basicEventuate = require('./basic'),
    post           = require('call-hook/post')

module.exports = createEventuate

function createEventuate (options) {
    var eventuate              = basicEventuate(options)

    eventuate.consumerAdded    = basicEventuate({ destroyResidual: false })
    eventuate.consumerRemoved  = basicEventuate({ destroyResidual: false })
    eventuate.destroyed        = basicEventuate({ destroyResidual: false })
    eventuate.error            = basicEventuate({ destroyResidual: false })
    eventuate.factory          = createEventuate
    eventuate.factory.basic    = basicEventuate
    eventuate.consume          = post(eventuate.consume, eventuate.consumerAdded.produce)
    eventuate.removeConsumer   = post(eventuate.removeConsumer, consumerRemoved)
    eventuate.destroy          = post(eventuate.destroy, eventuate.destroyed.produce)

    eventuate.error.consume        = post(eventuate.error.consume, errorConsumerAdded)
    eventuate.error.removeConsumer = post(eventuate.error.removeConsumer, errorConsumerRemoved)

    return eventuate

    function consumerRemoved (consumer) {
        if (this.previousReturnValue) eventuate.consumerRemoved.produce(consumer)
        return this.previousReturnValue
    }

    function errorConsumerAdded () {
        eventuate._error = eventuate.error.produce
    }

    function errorConsumerRemoved () {
        if (!eventuate.error.hasConsumer()) eventuate._error = undefined
    }
}
