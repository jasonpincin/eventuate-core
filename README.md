# eventuate-core

[![NPM version](https://badge.fury.io/js/eventuate-core.png)](http://badge.fury.io/js/eventuate-core)
[![Build Status](https://travis-ci.org/jasonpincin/eventuate-core.svg?branch=master)](https://travis-ci.org/jasonpincin/eventuate-core)
[![Coverage Status](https://coveralls.io/repos/jasonpincin/eventuate-core/badge.png?branch=master)](https://coveralls.io/r/jasonpincin/eventuate-core?branch=master)

Handle events without emitters or frills. 

This implements the core eventuate objects, with a limited feature set. You may also want to look at [eventuate](https://github.com/jasonpincin/eventuate) which aggregates this, and several other modules to provide a reactive api for handling data over time.


## example

TODO

## api

```javascript
var eventuate = require('eventuate-core')
```

### var event = eventuate()

Create an object, `event`, that represents a consumable event type.

Valid options are:

* requireConsumption - throw an error if a produced event is not consumed, useful for error producers

### event(consumer)

Consume events with the `consumer` function, which should have the signature `function (data) {}`. When an event is produced, it will be passed to the consumer function as the first and only argument. 

### event.produce(data)

Produce an event. All `event` consumer functions will be called with `data`. If the `requireConsumption` option was provided, and nothing consumes the data, an error will be thrown. In this case, if the data being produced is an instanceof `Error`, it will be thrown directly, otherwise an `UnconsumedEventError` (see below) will be thrown, and the data that was produced will be attached to the error as a `data` property.

### event.removeConsumer(consumer)

Remove the formerly added `consumer`, so that it will not be called with future produced events.

### event.removeAllConsumers()

Remove all consumers from the eventuate `event`.

### event.hasConsumer

Property containing value `true` or `false`, indicating whether or not the event has a consumer.

### event.consumers

Property exposing a shallow copy of all consuming functions.

### event.consumerAdded(consumer)

Unmonitored eventuate representing additions of consumers. Any consumers of `consumerAdded` will be invoked with the consumer added to the `eventuate`.

Example:

```javascript
var event = eventuate()
event.consumerAdded(function (eventConsumer) {
    // eventConsumer will be the consumer function
    console.log('a consumer was added to event')
})
```

### event.consumerRemoved(consumer)

Unmonitored eventuate representing removal of consumers. Any consumers of `consumerRemoved` will be invoked with the consumer removed from the `eventuate`.

Example:

```javascript
var event = eventuate()
event.consumerRemoved(function (eventConsumer) {
    // eventConsumer will be the consumer function
    console.log('a consumer was removed from event')
})
```

### event.factory

Exposes the factory function used to create the eventuate. Example:

```javascript
var eventuate = require('eventuate'),
    assert    = require('assert')

var event = eventuate()
assert(event.factory === eventuate)
```

### var UnconsumedEventError = require('eventuate/errors').UnconsumedEventError

Constructor of error potentially thrown on eventuates with `requireConsumption` set.


## supporting modules

The following modules support and extend the functionality of eventuate:

* [eventuate-once](https://github.com/jasonpincin/eventuate-once) - act once (via callback or promise) upon the next occurrence of an eventuate
* [eventuate-filter](https://github.com/jasonpincin/eventuate-filter) - create filtered eventuate, acting as subset of broader eventuate

## install

```sh
npm install eventuate
```

## testing

`npm test [--dot | --spec] [--phantom] [--grep=pattern]`

Specifying `--dot` or `--spec` will change the output from the default TAP style. 
Specifying `--phantom` will cause the tests to run in the headless phantom browser instead of node.
Specifying `--grep` will only run the test files that match the given pattern.

### browser test

`npm run browser-test`

This will run the tests in all browsers (specified in .zuul.yml). Be sure to [educate zuul](https://github.com/defunctzombie/zuul/wiki/cloud-testing#2-educate-zuul) first.

### coverage

`npm run coverage [--html]`

This will output a textual coverage report. Including `--html` will also open 
an HTML coverage report in the default browser.
