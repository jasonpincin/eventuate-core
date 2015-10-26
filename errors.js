var defineError = require('define-error')

module.exports.EventuateUnconsumedError = defineError('EventuateUnconsumedError', assignData)

function assignData (_, data) {
    this.data = data
}
