var basicEventuate          = require('./basic'),
    pre                     = require('call-hook/pre'),
    post                    = require('call-hook/post'),
    EventuateDestroyedError = require('./errors').EventuateDestroyedError

module.exports = createEventuate

function createEventuate (options) {
    options = options || {}
    options.destroyResidual = options.destroyResidual !== undefined ? options.destroyResidual : false

    var eventuate = basicEventuate(options),
        destroyed = false

    eventuate.consumerAdded   = basicEventuate({ destroyResidual: false })
    eventuate.consumerRemoved = basicEventuate({ destroyResidual: false })
    eventuate.error           = basicEventuate({ destroyResidual: false })
    eventuate.destroyed       = basicEventuate({ destroyResidual: false })
    eventuate.destroy         = destroy
    eventuate.isDestroyed     = isDestroyed
    eventuate.produce         = pre(eventuate.produce, preProduce)
    eventuate.consume         = pre(post(eventuate.consume, consumerAdded), preConsume)
    eventuate.removeConsumer  = post(eventuate.removeConsumer, consumerRemoved)
    eventuate.factory         = createEventuate
    eventuate.factory.basic   = basicEventuate

    return eventuate

    function preProduce (data) {
        if (destroyed)
            throw new EventuateDestroyedError('Unable to produce from destroyed eventuate', data)
        if (data instanceof Error && eventuate.error.hasConsumer()) {
            eventuate.error.produce(data)
            this.abort()
        }
    }

    function preConsume (consumer) {
        if (destroyed) this.abort(eventuate)
    }

    function consumerAdded (consumer) {
        eventuate.consumerAdded.produce(consumer)
        return this.returnValue
    }

    function consumerRemoved (consumer) {
        if (this.returnValue) eventuate.consumerRemoved.produce(consumer)
        if (!eventuate.hasConsumer() && options.destroyResidual) eventuate.destroy()
        return this.returnValue
    }

    function isDestroyed () {
        return destroyed
    }

    function destroy () {
        if (!destroyed) {
            destroyed = true
            eventuate.removeAllConsumers()
            eventuate.destroyed.produce()
            return true
        }
        return false
    }
}
