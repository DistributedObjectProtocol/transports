// https://github.com/socketio/socket.io
function socketio(dop, listener, options) {

    if (options.server !== undefined && options.httpServer === undefined)
        options.httpServer = options.server;

    var api = options.transport.api(),
        transport = new api( options.httpServer, options );

    if (typeof options.httpServer == 'undefined')
        transport.listen((typeof options.port != 'number') ? 4445 : options.port);

    transport
    .of((typeof options.namespace != 'string') ? dop.name : options.namespace)
    .on('connection', function( socket ){

        socket.send = function(message) {
            socket.emit('message', message);
        };;

        socket.close = function( ) {
            socket.disconnect();
        };;

        dop.core.onopenServer(listener, socket, options.transport);

        socket.on('message', function(message){
            dop.core.onmessage(listener, socket, message);
        });

        socket.on('disconnect', function(){
            dop.core.oncloseServer(listener, socket);
        });
    });

    return transport;
};

socketio.api = function() { return require('socket.io') };
module.exports = socketio;