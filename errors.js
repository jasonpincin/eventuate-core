var defineError = require('define-error')

module.exports.EventuateUnconsumedError = defineError('EventuateUnconsumedError', assignData)
module.exports.EventuateDestroyedError = defineError('EventuateDestroyedError', assignData)

function assignData (_, data) {
    this.data = data
}
