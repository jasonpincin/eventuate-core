var eventuate = require('..')

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
