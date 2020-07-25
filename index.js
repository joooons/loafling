
const PORT = process.env.PORT || 3000;

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);




var lobbyNameMap = new Map();




io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    lobbyNameMap.delete(socket.id);
    let arr = [];
    lobbyNameMap.forEach( (val, key) => {
      let obj = { id: 'none', name: 'none' }
      obj.id = key;
      obj.name = val;
      arr.push(obj);
    });
    io.emit('new-user', arr);
  });


  socket.on('new-user', data => {
    let arr = [];
    lobbyNameMap.set(socket.id, data);
    lobbyNameMap.forEach( (val, key) => {
      let obj = { id: 'none', name: 'none' }
      obj.id = key;
      obj.name = val;
      arr.push(obj);
    });
    io.emit('new-user', arr);
  });


});




app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

