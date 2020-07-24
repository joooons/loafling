
const PORT = process.env.PORT || 3000;
// const INDEX = '/index.html';

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);



io.on('connection', (socket) => {
  socket.on('message', data => {
    io.emit('message', data);
  });
});




app.use(express.static(path.join(__dirname, 'public') ) );

server.listen(PORT, () => console.log(`Listening on ${PORT}`));




// io.on('connection', (socket) => { console.log('client connected'); });
// setInterval( () => { io.emit('time', new Date().toTimeString()) }, 1000);



