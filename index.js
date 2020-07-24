

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const express = require('express');
const socketIO = require('socket.io');

const server = express()
  .use((req, res) => {res.sendFile(INDEX, {root: __dirname})})
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

// io.on('connection', (socket) => { console.log('client connected'); });
// setInterval( () => { io.emit('time', new Date().toTimeString()) }, 1000);

io.on('connection', (socket) => {
  socket.on('message', data => {
    io.emit('message', data);
  });
});