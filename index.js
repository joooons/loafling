

// INITIAL SETUP ______________________________________________

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
// const squareCount = Math.pow(boardDim, 2);








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

function hasMapValue( map, roomName ) {
  // console.log('---------------');
  let arr = [];
  map.forEach( (val) => {
    arr.push(val);
  });
  // let arr = Array.from( map.values() );
  let bool = arr.includes(roomName);
  return bool;
}





function emptyGrid(num) {
  let length = Math.pow(num, 2);
  let color = '#0005';
  let arr = new Array(length).fill(color);
  return arr;
}




function displayName_Room( text ) {
  console.log('         ');
  console.log(`--- Name_Room right after ( ${text} ) ----`)
  Name_Room.forEach( (val, key) => {
    console.log('   ', key, val);
  });
}





// THE SOCKET.IO ENVIRONMENT ______________________________________

io.on('connection', (socket) => {
  
  console.log(`----- ${socket.id} connected --------------`);



  // DISCONNECT
  socket.on('disconnect', () => {
    let name = ID_Name.get(socket.id);
    console.log(`( user: ${name} ) disconnected...`);

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

    
    // console.log('----------------');
    // console.log('all rooms in Name_Room: ');
    let roomArr = [];
    Name_Room.forEach( val => {
      roomArr.push(val);
      // console.log('    ', val);
    });
    
    // console.log('unique rooms in Name_Room: ');
    let newRoomArr = _.uniq(roomArr);
    newRoomArr.forEach( val => {
      // console.log('    ', val);
      if (val != 'lobby') {
        socket.emit('add roombox', val);
      }
    });


    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);
    
    
  });




  // WHEN USER JOINS A ROOM
  // socket.on('join room', roomID => {
  //   let name = ID_Name.get(socket.id);
  //   Name_Room.set(name, roomID);

  //   let arr = MapToArray( Name_Room, "name", "room");
  //   io.emit('update names', arr);

  //   if (roomID != 'lobby') {
  //     socket.join(roomID);
  //     // io.to(roomID).emit('update board', Room_Grid.get(roomID));
  //   }
  // });



  // WHEN USER CREATES A ROOM
  socket.on('create room', roomName => {

    let name = ID_Name.get(socket.id);
    Name_Room.set(name, roomName);
    socket.join(roomName);

    Room_Grid.set( roomName, emptyGrid( boardDim ));


    io.emit('add roombox', roomName);

    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);
  
    displayName_Room('end of create room');
  });




  socket.on('req grid update', room => {
    io.to(room).emit('res grid update', Room_Grid.get(room) );
  });





  socket.on('join room', room => {
    let name = ID_Name.get(socket.id);
    let oldRoom = Name_Room.get(name);
      // console.log('          ');
      // console.log('------------');
      // console.log('oldRoom: ', oldRoom);
      // console.log('newRoom: ', room);
      // displayName_Room('join room');

    socket.leave(oldRoom);

    Name_Room.set(name, room);
  
    let bool = hasMapValue(Name_Room, oldRoom);

    // console.log(`is ${oldRoom} included in Name_Room? `, bool);
    displayName_Room('after i set room');
    // console.log(!bool);

    if ( !bool ) {
      // console.log('did it work?');
      io.emit('del roombox', oldRoom );
      // console.log('server: del roombox');
    }

    if ( room != 'lobby' ) {
      socket.join(room);
    }

    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);

  });






});   // END OF IO.ON()




app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

