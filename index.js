
const PORT = process.env.PORT || 3000;

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);




// local variables __________________________

var ID_Name = new Map();
  // Map { socket.id , name }

var Name_Room = new Map();
  // Map { name , room }






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
    ID_Name.set(socket.id, name);
    Name_Room.set(name, 'room0');
    console.log(`${name} connected!`);

    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);
  });


  // WHEN USER JOINS A ROOM
  socket.on('join room', roomID => {
    let name = ID_Name.get(socket.id);
    Name_Room.set(name, roomID);

    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);
  });



});




app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

