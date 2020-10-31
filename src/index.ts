import express from 'express';
import io from 'socket.io';
import http from 'http';
import network, { NetworkEvents } from './tracing/network';

const config = {
  path: '/.well-known/tracequest'
};

const app = express();
const server = http.createServer();
const socket = io({
  path: config.path,
});

network.events.on(NetworkEvents.LINKING, (event) => {
  socket.emit(NetworkEvents.LINKING, event);
});

network.events.on(NetworkEvents.END, (event) => {
  socket.emit(NetworkEvents.END, event);
});

app.get(`${config.path}/status`, (req, res) => {
  return res.send({
    started: network.started,
  });
});

app.on('mount', (parent) => {
  // We're supplementing our parent
  // Express application with a server controlled by us,
  // might not work well with https module.
  parent.listen = function() {
    server.on('request', parent);
    socket.attach(server);

    return server.listen.apply(server, arguments);
  };
});

export default app;