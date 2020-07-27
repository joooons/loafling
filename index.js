
const PORT = process.env.PORT || 3000;

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const _ = require('underscore');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);




// LOCAL VARIABLES _________________________________

var ID_Name = new Map();
var Name_Room = new Map();
var Room_Grid = new Map();

const boardDim = 4;




// LOCAL FUNCTIONS _________________________________

function MapToArray( map, keyStr, valStr ) {
  let arr = []; 
    map.forEach( (val, key) => {
      let obj = {};
      obj[keyStr] = key;
      obj[valStr] = val;
      arr.push( obj );
    });
  return arr;
}


function emptyGrid(num) {
  let length = Math.pow(num, 2);
  let arr = new Array(length).fill(0);
  return arr;
}








// THE SOCKET.IO ENVIRONMENT __________________

io.on('connection', (socket) => {
  
  console.log('--------------------------');
  console.log('A user connected. But who?');



  // DISCONNECT
  socket.on('disconnect', () => {
    let name = ID_Name.get(socket.id);
    console.log(`${name} disconnected. Boo...`);

    Name_Room.delete(name);
    ID_Name.delete(socket.id);

    let arr = MapToArray(Name_Room, "name", "room");
    io.emit('update names', arr);
  
  });



  // WHEN NEW USER ENTERS
  socket.on('new user', name => {
    socket.emit('board config', boardDim);
    
    ID_Name.set(socket.id, name);
    Name_Room.set(name, 'lobby');
    console.log(`${name} connected!`);

    

    let roomArr = [];
    Name_Room.forEach( val => {
      roomArr.push(val);
      console.log('room ', val);
    });
    
    
    let newRoomArr = _.uniq(roomArr);
    newRoomArr.forEach( val => {
      console.log('new room: ', val);
      if (val != 'lobby') {
        socket.emit('create room', val);
      }
      
    });


    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);
    
    
  });




  // WHEN USER JOINS A ROOM
  socket.on('join room', roomID => {
    let name = ID_Name.get(socket.id);
    Name_Room.set(name, roomID);

    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);

    if (roomID != 'lobby') {
      socket.join(roomID);
      // io.to(roomID).emit('update board', Room_Grid.get(roomID));
    }
  });



  // WHEN USER CREATES A ROOM
  socket.on('create room', roomName => {
    Room_Grid.set(roomName, emptyGrid(boardDim));
    io.emit('create room', roomName);

  });



});   // END OF IO.ON()




app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

