import app from '../app';
import debugLib from 'debug';
import http from 'http';
import https from 'https';
import cluster from 'cluster';
import config from '../core/config';
import fs from 'fs';

if (cluster.isMaster) {
    cluster.fork();
    cluster.on('exit', function (worker, code, signal) {
        cluster.fork();
    });
}

let debug;
let server;
let serverSsl;
if (cluster.isWorker) {
    debug = new debugLib('cms:server');

    const port = normalizePort(process.env.PORT || config.server.port);
    const portSsl = normalizePort(process.env.PORT || config.server.portSsl);
    app.set('port', port);

    server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    var credentials = {
        key:  fs.readFileSync('./sslcert/key.pem'),
        cert: fs.readFileSync('./sslcert/cert.pem')
    };
    serverSsl = https.createServer(credentials, app);
    serverSsl.listen(portSsl);
    serverSsl.on('error', onError);
    serverSsl.on('listening', onListeningSsl);
}

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    // debug('Listening on ' + bind);
    console.log('Listening on ' + bind);
}

function onListeningSsl() {
    const addr = serverSsl.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    // debug('Listening on ' + bind);
    console.log('Listening on ' + bind);
}
