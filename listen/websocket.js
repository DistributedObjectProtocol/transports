// https://github.com/websockets/ws
function ws(dop, options) {
    // Defaults
    if (typeof options.port != 'number' && options.server === undefined) {
        options.port = 4444
    }
    if (options.httpServer !== undefined && options.server === undefined) {
        options.server = options.httpServer
    }
    if (typeof options.namespace != 'string') {
        options.namespace = '/' + dop.name
    }

    options.perMessageDeflate = false // https://github.com/websockets/ws/issues/923

    var WebSocketServer = options.transport.getApi()
    var ws_server = new WebSocketServer(options)
    var transport = dop.createTransport(ws_server)
    ws_server.on('connection', function(socket) {
        function send(message) {
            if (socket.readyState === 1) {
                socket.send(message)
                return true
            }
            return false
        }
        function disconnect() {
            socket.close()
        }
        var node = transport.onCreate(socket, send, disconnect)
        transport.onConnect(node)
        socket.on('message', function(message) {
            transport.onMessage(node, message)
        })
        socket.on('close', function() {
            transport.onDisconnect(node)
        })
        socket.on('error', function(error) {
            transport.onError(node, error)
        })
    })

    return transport
}

ws.getApi = function() {
    return require('ws').Server
}
module.exports = ws
