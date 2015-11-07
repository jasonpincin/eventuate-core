var basicEventuate = require('./basic'),
    pre            = require('call-hook/pre'),
    post           = require('call-hook/post')

module.exports = createEventuate

function createEventuate (options) {
    var eventuate              = basicEventuate(options)

    eventuate.consumerAdded    = basicEventuate({ destroyResidual: false })
    eventuate.consumerRemoved  = basicEventuate({ destroyResidual: false })
    eventuate.destroyed        = basicEventuate({ destroyResidual: false })
    eventuate.error            = basicEventuate({ destroyResidual: false })
    eventuate.produce          = pre(eventuate.produce, splitErrors)
    eventuate.consume          = post(eventuate.consume, consumerAdded)
    eventuate.removeConsumer   = post(eventuate.removeConsumer, consumerRemoved)
    eventuate.destroy          = post(eventuate.destroy, destroyed)
    eventuate.factory          = createEventuate
    eventuate.factory.basic    = basicEventuate

    return eventuate

    function splitErrors (data) {
        if (data instanceof Error && eventuate.error.hasConsumer()) {
            eventuate.error.produce(data)
            this.abort()
        }
    }

    function consumerAdded (consumer) {
        eventuate.consumerAdded.produce(consumer)
        return this.returnValue
    }

    function consumerRemoved (consumer) {
        if (this.returnValue) eventuate.consumerRemoved.produce(consumer)
        return this.returnValue
    }

    function destroyed () {
        eventuate.destroyed.produce()
        return this.returnValue
    }

}
