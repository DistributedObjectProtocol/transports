// https://github.com/websockets/ws
var connectWebsocket = require('./websocket')
function ws() {
    return connectWebsocket.apply(this, arguments)
}

ws.getApi = function() {
    return require('ws')
}
module.exports = ws
