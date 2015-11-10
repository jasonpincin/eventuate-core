module.exports = createBasicEventuate

function createBasicEventuate () {
    var consumers = []

    eventuate.produce        = produce
    eventuate.consume        = consume
    eventuate.hasConsumer    = hasConsumer
    eventuate.removeConsumer = removeConsumer
    eventuate.factory        = createBasicEventuate

    return eventuate

    function eventuate (consumer) {
        return eventuate.consume(consumer)
    }

    function produce (data) {
        for (var i = 0; i < consumers.length; i++) {
            consumers[i](data)
        }
    }

    function consume (consumer) {
        if (typeof consumer !== 'function') throw new TypeError('eventuate consumer must be a function')
        consumers.push(consumer)
        return eventuate
    }

    function hasConsumer (consumer) {
        return consumer ? consumers.indexOf(consumer) > -1 : consumers.length > 0
    }

    function removeConsumer (consumer) {
        var consumerIdx = consumers.indexOf(consumer)
        if (consumerIdx === -1) return false
        consumers.splice(consumerIdx, 1)
        return true
    }
}
