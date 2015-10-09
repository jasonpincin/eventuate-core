var defineError = require('define-error'),
    assign      = require('object-assign')

module.exports.EventuateUnconsumedError = defineError('EventuateUnconsumedError', assignData)
module.exports.EventuateEndedError = defineError('EventuateEndedError')

function assignData (_, data) {
    assign(this, data)
}
