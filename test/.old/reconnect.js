var test = require('tape')
var dop = require('dop')
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

var transportName = process.argv[2] || 'development'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('RECONNECT TEST', function(t) {
    var server = dopServer.listen({ transport: transportListen })
    var client = dopClient.connect({
        transport: transportConnect,
        listener: server
    })

    var nodeServer,
        nodeClient,
        socketServer,
        socketClient,
        tokenServer,
        tokenClient

    server.on('connect', function(node) {
        t.equal(nodeServer, undefined, 'SERVER connect')
        nodeServer = node
        socketServer = node.socket
        tokenServer = node.token
        // Disconnecting
        setTimeout(function() {
            // console.log( 'closing...' );
            nodeClient.socket.close()
        }, 500)
    })
    client.on('connect', function(node) {
        t.equal(nodeClient, undefined, 'CLIENT connect')
        nodeClient = node
        socketClient = node.socket
        tokenClient = node.token
    })

    server.on('reconnecting', function(node) {
        t.equal(nodeServer, node, 'SERVER reconnecting')
    })

    client.on('reconnecting', function(node) {
        t.equal(nodeClient, node, 'CLIENT reconnecting')
        node.reconnect()
    })

    server.on('reconnect', function(node) {
        const nodesByToken = Object.keys(server.nodesByToken).length
        t.equal(
            node === nodeServer && node.socket !== socketServer,
            true,
            'SERVER reconnect'
        )
        t.equal(nodesByToken, 1, 'server nodesByToken 1')
        // t.equal(server.nodesBySocket.size, 1, 'server nodesBySocket 1')
        t.equal(node.token, nodeServer.token, 'same token')
    })
    client.on('reconnect', function(node) {
        const nodesByToken = Object.keys(client.nodesByToken).length
        t.equal(
            node === nodeClient && node.socket !== socketClient,
            true,
            'CLIENT reconnect'
        )
        t.equal(nodesByToken, 1, 'client nodesByToken 1')
        // t.equal(client.nodesBySocket.size, 1, 'client nodesBySocket 1')
        t.equal(node.token, nodeClient.token, 'same token')
        t.end()
        node.closeSocket() // avoid reconnections
        server.close() // this must terminate the server
    })
})