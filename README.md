# eventuate-core

[![NPM version](https://badge.fury.io/js/eventuate-core.png)](http://badge.fury.io/js/eventuate-core)
[![Build Status](https://travis-ci.org/jasonpincin/eventuate-core.svg?branch=master)](https://travis-ci.org/jasonpincin/eventuate-core)
[![Coverage Status](https://coveralls.io/repos/jasonpincin/eventuate-core/badge.png?branch=master)](https://coveralls.io/r/jasonpincin/eventuate-core?branch=master)

Handle events without emitters or frills. 

This implements the core eventuate objects, with a limited feature set. You may
also want to look at [eventuate](https://github.com/jasonpincin/eventuate) which
aggregates this, and several other modules to provide a reactive api for
handling data over time.


## example

```javascript
var eventuate = require('eventuate-core')

// lets create a server object
var server = {}

// this server will produce request events
server.request = eventuate()

// lets consume them!
server.request(function onRequest (req) {
  console.log('we got a request for ' + req.url)
})

// lets produce some of these requests
server.request.produce({ url: '/hello.js' })
server.request.produce({ url: '/world.js' })
server.request.produce({ url: '/bye.js' })
```

## api

```javascript 
var eventuate = require('eventuate-core') 
```

### var event = eventuate(options)

Create an object, `event`, that represents a consumable event type.

Valid options are:

* `requireConsumption` (default: `false`) - throw an error if a produced event is not consumed,
  useful for error producers
* `destroyResidual` (default: `false`) - call the destroy function when the last
  consumer is removed via `removeConsumer` or `removeAllConsumers` (after at
  least one consumer was added)

### event(consumer)

Convenient shortcut for calling `event.consume(consumer)`.

### event.consume(consumer)

Consume events with the `consumer` function, which should have the signature
`function (data [, done]) {}`. When an event is produced, it will be passed to the
consumer function as the first argument.

If the `consumer` accepts a 2nd argument, it will be passed a `done` callback
that should be called when the consumer is done processing the data event. This
is mandatory if you intend to support backpressure (aka eventuate saturation).

To fully support saturation, in addition to calling the `done` callback, the
`consumer` function should have an `isSaturated` method, which when called will
return a boolean value, indicating whether or not the consumer is saturated.
When the eventuate produces a value that is consumed by the `consumer`,
`isSaturated` will be checked. If `true` is returned, this will cause the 
eventuate to produce on the `saturated` 
[basic eventuate](https://github.com/jasonpincin/basic-eventuate) property. 
When the `done` callback is called, the eventuate will check `isSaturated`
again. If no consumers are considered `saturated`, then the eventuate will
produce on the `unsaturated` basic eventuate. 

These events may be used to implement back-pressure on sources that support it.

Returns `event`.

### event.produce(data)

Produce an event. All `event` consumer functions will be called with `data`. If
the `requireConsumption` option was provided, and nothing consumes the data, an
error will be thrown. In this case, if the data being produced is an instanceof
`Error`, it will be thrown directly, otherwise an `UnconsumedEventError` (see
below) will be thrown, and the data that was produced will be attached to the
error as a `data` property.

### event.removeConsumer(consumer)

Remove the formerly added `consumer`, so that it will not be called with future
produced events. 

If the `consumer` function has a property of `removed`, and that property is a
function, it will be executed (with no arguments) after it is removed.

### event.removeAllConsumers()

Remove all consumers from the eventuate `event`. 

### event.hasConsumer()

Returns `true` is the eventuate has any consumers, otherwise `false`.

### event.getConsumers()

Returns a shallow copy of the array of all consuming functions.

### event.destroy() 

Remove all consumers, prevent further consumers from being added, and throw an
EventuateDestroyedError if further `produce` calls are attempted. This function
is called automatically when the last consumer is removed if the
`destroyResidual` option was set to true.

### event.isDestroyed() 

Returns `true` if the eventuate has been destroyed, otherwise `false`.

### event.isSaturated() 

Returns `true` if any consumers are saturated, otherwise `false`.

### event.error(consumer)

A [basic eventuate](https://github.com/jasonpincin/basic-eventuate) representing 
`Error` objects produced by the eventuate. By assigning a handler to the 
`event.error`, any `Error` objects produced will no longer be supplied to 
`event` consumers; only `event.error` consumers will receive them.

### event.consumerAdded(consumer)

A basic eventuate representing additions of consumers. 
Any consumers of `consumerAdded` will be invoked and passed the `consumer` function 
that was added to the eventuate.

Example:

```javascript 
var event = eventuate() 
event.consumerAdded(function (eventConsumer) {
    console.log('a consumer was added to event: ' + eventConsumer.name) 
}) 
```

### event.consumerRemoved(consumer)

A basic eventuate representing removal of consumers. Any consumers of
`consumerRemoved` will be invoked with the `consumer` function removed from the
`eventuate`.

Example:

```javascript 
var event = eventuate() 
event.consumerRemoved(function (eventConsumer) {
    console.log('a consumer was removed from event: ' + eventConsumer.name) 
}) 
```

### event.saturated

A basic eventuate that produces (no payload) when any consumer enters a
saturated state.

### event.unsaturated

A basic eventuate that produces (no payload), when the eventuate is no longer
considered saturated (i.e. no consumers are saturated).

### event.destroyed(consumer)

A basic eventuate representing destruction of the event. This eventuate occurs
only one time, after `destroy` is called. This eventuate will not occur if
`destroyResidual` was set to `false` at eventuate creation.

### event.factory

Exposes the factory function used to create the eventuate. Example:

```javascript 
var eventuate = require('eventuate'), 
    assert    = require('assert')

var event = eventuate() 
assert(event.factory === eventuate) 
```

## eventuate error types

```javascript
var errors = require('eventuate/errors')
```
### errors.EventuateUnconsumedError

Constructor of error potentially thrown from `eventuate.produce` when 
`requireConsumption` is true.

### errors.EventuateDestroyedError

Constructor of error thrown from `eventuate.produce` when the eventuate is
already destroyed.

## supporting modules

The following modules support and extend the functionality of eventuate and are
included in the [eventuate](https://github.com/jasonpincin/eventuate) module 
(without the _-core_).

* [eventuate-next](https://github.com/jasonpincin/eventuate-next) - act once
  (via callback or promise) upon the next occurrence of an eventuate
* [eventuate-filter](https://github.com/jasonpincin/eventuate-filter) - create
  filtered eventuate, acting as subset of broader eventuate
* [eventuate-map](https://github.com/Georgette/eventuate-map) - create mapped
  eventuates, producing events transformed from the source eventuate
* [eventuate-reduce](https://github.com/Georgette/eventuate-reduce) - create an
  eventuate that reduces events produced from a source eventuate

## mixin

The eventuate core mixin may be used to add eventuate core functionality to
another object. You should first assign the mixin's properties, then call the
mixin in the context of your object to initialize it.

For example:

```javascript
var eventuateCoreMixin = require('eventuate-core/mixin')

var myObject = {}
Object.assign(myObject, eventuateCoreMixin.properties)
eventuateCoreMixin.call(myObject /*, options */)
```

## constructor

Alternatively, the constructor may be required and used for extending or
creating new eventuate objects. Be warned, that `new EventuateCore` will return
a non-function object, meaning the `event(consumer)` shortcut will not work.
The long-form `event.consume(consumer)` will need to be required.

```javascript
const EventuateCore = require('eventuate-core/constructor')
var event = new EventuateCore
```

## install

With [npm](https://npmjs.org) do:

```
npm install --save eventuate-core
```

## testing

`npm test`

Or to run tests in phantom: `npm run phantom`

### coverage

`npm run view-cover`

This will output a textual coverage report.

`npm run open-cover`

This will open an HTML coverage report in the default browser.
