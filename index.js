

// INITIAL SETUP ______________________________________________

const PORT = process.env.PORT || 3000;

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const _ = require('underscore');
// const { has } = require('underscore');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);








// LOCAL VARIABLES _________________________________

var ID_Name = new Map();
var Name_Room = new Map();
var Room_Grid = new Map();

const boardDim = 5;
const nameSuffix = [ ', stop', 'ster', 'ette', 'ness', 'man', 'lord', 'ie' ];
const roomSuffix = [ ', stop', 'wood', 'istan', 'ia', 'ville', 'town', 'land' ];








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



function hasMapValue( map, item ) {
  return Array.from( map.values() ).includes( item );
}



function emptyGrid(num) {
  let length = Math.pow(num, 2);
  let value = '-';
  let arr = new Array(length).fill(value);
  return arr;
}



function displayName_Room( text ) {
  console.log('         ');
  console.log(`--- Name_Room @ ( ${text} ) ---`)
  Name_Room.forEach( (val, key) => {
    console.log('   ', key, val);
  });
}



function avoidDuplicate( map, suggestedName, suffix ) {
  let num = suffix.length;
  let name = suggestedName;
  while ( hasMapValue( map, name ) ) {
    if (num > 0 ) { 
      num--; 
      name = suggestedName + `${ suffix[num]}`;
    } else {
      let str = '';
      for ( i=0 ; i<4 ; i++ ) {
        let num = Math.floor( Math.random() * 10 );
        str += num.toString();
      }
      name = suggestedName + `-${str}`;
    }
  }
  return name;
}




// THE SOCKET.IO ENVIRONMENT ______________________________________

io.on('connection', (socket) => {
  
  console.log(`----- ${socket.id} connected --------------`);
  // console.log(`${ID_Name.size} users connected`);



  // DISCONNECT
  socket.on('disconnect', () => {
    let name = ID_Name.get(socket.id);
   

    Name_Room.delete(name);
    ID_Name.delete(socket.id);

    console.log(`( user: ${name} ) disconnected...`);
    console.log(`${ID_Name.size} users still connected`);

    let arr = MapToArray(Name_Room, "name", "room");
    io.emit('update names', arr);
  
  });



  // WHEN NEW USER ENTERS
  socket.on('new user', suggestedName => {
    // let name = suggestedName;
    socket.emit('board config', boardDim);
    
    let name = avoidDuplicate( ID_Name, suggestedName, nameSuffix );
    if ( name != suggestedName ) {
      socket.emit('change name', name );
    }

    ID_Name.set(socket.id, name);
    Name_Room.set(name, 'lobby');
    console.log(`${name} connected!`);


    let roomArr = [];
    Name_Room.forEach( val => {
      roomArr.push(val);
    });
    
    let newRoomArr = _.uniq(roomArr);
    newRoomArr.forEach( val => {
      if (val != 'lobby') {
        socket.emit('add roombox', val);
      }
    });


    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);
    
    
  });





  // WHEN USER CREATES A ROOM
  socket.on('create room', roomName => {

    let room = avoidDuplicate( Name_Room, roomName, roomSuffix );

    if ( room != roomName ) {
      socket.emit('change room name', room );
    }


    let name = ID_Name.get(socket.id);
    Name_Room.set(name, room);
    socket.join(room);

    Room_Grid.set( room, emptyGrid( boardDim ));

    io.emit('add roombox', room);

    let arr = MapToArray( Name_Room, "name", "room");
    io.emit('update names', arr);
  
  });




  socket.on('req grid update', room => {
    io.to(room).emit('res grid update', Room_Grid.get(room) );
  });



  socket.on('update grid', gridArr => {
    let name = ID_Name.get(socket.id);
    let room = Name_Room.get(name);
    Room_Grid.set(room, gridArr);
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
    // displayName_Room('after i set room');
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

    displayName_Room('update names');

  });






});   // END OF IO.ON()




app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

