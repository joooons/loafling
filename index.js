

// INITIAL SETUP ______________________________________________

const PORT = process.env.PORT || 3000;

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const _ = require('underscore');
// const { timingSafeEqual } = require('crypto');
// const { has } = require('underscore');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);








// ________________________________________ INITIAL SETUP (END)

// LOCAL VARIABLES ____________________________________________

var ID_Name = new Map();
var Name_Room = new Map();
var Room_GameData = new Map();
var Room_PlayerArr = new Map();
var Room_Score = new Map();

const nameSuffix = [', stop', 'ster', 'ette', 'ness', 'man', 'lord', 'ie' ];
const roomSuffix = [', stop', 'wood', 'istan', 'ia', 'ville', 'town', 'land' ];
const colorSet = ['violet', 'chartreuse', 'skyblue', 'pink', 'yellow', 'black', '#FFF0'];
  // For iterating through variations to avoid duplicates.

const boardDim = 5;
const noName = 'zz'
  // variables to synchronize to client










// ______________________________________ LOCAL VARIABLES (END)

// OBJECT CONSTRUCTOR _________________________________________

function GameData() {
    this.colorMap = new Map();
      // Map of NAME to COLOR assigned to that name in this room.
    this.grid = [];
      // Array of NAME associated with that index-position on board.
}











// ___________________________________ OBJECT CONSTRUCTOR (END)

// LOCAL FUNCTIONS ____________________________________________

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



function hasMapValue( map, item ) { return Array.from( map.values() ).includes( item ); }



function giveUniqColor( map ) {    
  let num = colorSet.length-1;
  while ( hasMapValue(map,colorSet[num]) == true ) { num--; }
  return colorSet[num];
}



function emptyGrid(num) { return new Array( Math.pow(num, 2) ).fill(noName); }



function mapUniqValArr( map ) {
  let arr = [];
  map.forEach( val => { arr.push(val); });
  return _.uniq(arr);
}



function displayName_Room( text ) {
  console.log('         ');
  console.log(`--- Name_Room @ ( ${text} ) ---`)
  Name_Room.forEach( (val, key) => {
    console.log('   ', key, val);
  });
}



function avoidDuplicate( map, root, suffix ) {
  let num = suffix.length;
  let newName = root;
  while ( hasMapValue( map, newName ) ) {
    if (num > 0 ) { 
      num--; 
      newName = root + `${suffix[num]}`;
    } else {
      let str = '';
      for ( i=0 ; i<4 ; i++ ) {
        let num = Math.floor( Math.random() * 10 );
        str += num.toString();
      }
      newName = root + `-${str}`;
    }
  }
  return newName;
}



function startPlayerList(room) {
  Room_PlayerArr.set(room, []);
}



function addPlayer(room, name) {
  Room_PlayerArr.get(room).push(name);
}



function delPlayer(room, name) {
  let arr = Room_PlayerArr.get(room);
  Room_PlayerArr.set(room, _.without(arr, name) );
}

function updatePlayerList(room, arr) {
  Room_PlayerArr.set(room, arr);
}



function updateScore(room, scoreObj) {

  console.log('-------');
  console.log('-------');
  console.log('existing Room_Score: ', Room_Score);
  console.log('incoming scoreObj:   ', scoreObj);
  console.log('    ');

  if ( !Room_Score.has(room) ) { 
    Room_Score.set(room, scoreObj); 
    console.log('new room, new map...');
    console.log('final Room_Score: ', Room_Score);
  } else {
    let obj = Room_Score.get(room);
    Object.keys(scoreObj).forEach( name => {
      obj[name] = scoreObj[name];
      if (obj[name] == -1) {
        delete obj[name];
      }
    });
    Room_Score.set(room, obj);
    console.log('existing room...');
    console.log('final Room_Score: ', Room_Score);
  }
  
  io.to(room).emit('update score', Room_Score.get(room) );
}















// ______________________________________ LOCAL FUNCTIONS (END)

// THE SOCKET.IO ENVIRONMENT __________________________________

io.on('connection', (socket) => {
  
  console.log(`--------- ${socket.id} connected ----------`);
  socket.emit('synchronize variables', noName, boardDim);


  
  // _______ DISCONNECT _______________________________________

  socket.on('disconnect', () => {
    let name = ID_Name.get(socket.id);
    let room = Name_Room.get(name);

    Name_Room.delete(name);
    ID_Name.delete(socket.id);

    console.log(`( user: ${name} ) disconnected...`);
    console.log(`${ID_Name.size} users still connected`);

    let scoreObj = {};
    scoreObj[name] = -1;
    updateScore(room, scoreObj);
    
    delPlayer(room, name);
      // remove player from playerlist

    if ( !hasMapValue(Name_Room, room) ) {
      io.emit('del roombox', room );
      Room_GameData.delete(room);
      Room_PlayerArr.delete(room);
      Room_Score.delete(room);
    } else {
      io.to(room).emit('update player list', Room_PlayerArr.get(room) );
    }

    io.emit('update names', MapToArray(Name_Room, "name", "room"));
  
  });   // _______ DISCONNECT (END) _______________________________________




  
  // _______ NEW USER _________________________________________

  socket.on('new user', suggestedName => {

    socket.emit('board config', boardDim);
    
    let name = avoidDuplicate( ID_Name, suggestedName, nameSuffix );
    if ( name != suggestedName ) { socket.emit('change name', name ); }

    ID_Name.set(socket.id, name);
    Name_Room.set(name, 'lobby');
    console.log(`${name} connected!`);

    mapUniqValArr( Name_Room ).forEach( val => {
      if (val != 'lobby') { socket.emit('add roombox', val); }
    });

    io.emit('update names', MapToArray(Name_Room, "name", "room"));
    
  });   // _______ NEW USER (END) _________________________________________




  
  // _______ CREATE ROOM ______________________________________

  socket.on('create room', roomName => {

    let room = avoidDuplicate( Name_Room, roomName, roomSuffix );
    if ( room != roomName ) { socket.emit('change room name', room ); }
      // Assign a unique name.

    let name = ID_Name.get(socket.id);
    Name_Room.set(name, room);
    socket.join(room);
      // be the first to join

    startPlayerList(room);
    addPlayer(room, name);
      // make list of players in this room

    let obj = new GameData;
    obj.colorMap.set(noName, giveUniqColor(obj.colorMap) );
    obj.colorMap.set(name, giveUniqColor(obj.colorMap) );
    obj.grid = emptyGrid( boardDim );
    Room_GameData.set( room, obj );
      // Initialize Room_GameData map, and assign colors.

    io.emit('add roombox', room);
    io.emit('update names', MapToArray(Name_Room, "name", "room"));
    io.to(room).emit('update player list', Room_PlayerArr.get(room) );

  });   // _______ CREATE ROOM (END) ______________________________________


  // _________ UPDATE SCORE ____________________________________________

  socket.on('update score', (room, scoreObj) => {
    updateScore(room, scoreObj);
  });   // _________ UPDATE SCORE (END) ____________________________________________







  
  // _______ UPDATE GRID ON CLIENT ______________________________________

  socket.on('update grid on client', room => {
    
    let obj = Room_GameData.get(room);
    let arrOfMap = MapToArray( obj.colorMap, 'name', 'color');
    let arrOfGrid = obj.grid;
    io.to(room).emit('update grid', arrOfMap, arrOfGrid ); 

  });   // ___________ UPDATE GRID ON CLIENT (END) __________________________________






  
  // _______ UPDATE GRID ON SERVER ______________________________________

  socket.on('update grid on server', gridArr => {
    let name = ID_Name.get(socket.id);
    let room = Name_Room.get(name);

    let obj = Room_GameData.get(room);
    obj.grid = gridArr;
    Room_GameData.set(room, obj);

    let arrOfMap = MapToArray( obj.colorMap, 'name', 'color');
    let arrOfGrid = obj.grid;

    io.to(room).emit('update grid', arrOfMap, arrOfGrid ); 

  });   // _______ UPDATE GRID ON SERVER (END) ______________________________________





  
  // _______ JOIN ROOM ________________________________________

  socket.on('join room', room => {
    
    let name = ID_Name.get(socket.id);
    let oldRoom = Name_Room.get(name);
      // save data for use in this function

    Name_Room.set(name, room);
    socket.leave(oldRoom);
      // Leave old room. It's important to do this before what follows.

    if (oldRoom != 'lobby') delPlayer(oldRoom, name);
      // remove player from playerlist

    if ( !hasMapValue(Name_Room, oldRoom) ) {
      io.emit('del roombox', oldRoom );
      Room_GameData.delete(oldRoom);
      Room_PlayerArr.delete(oldRoom);
      Room_Score.delete(oldRoom);
    } else {
      io.to(oldRoom).emit('update player list', Room_PlayerArr.get(oldRoom) );
    }
      // remove empty rooms.
      // if oldroom is not empty, send player list to old room

    
    if ( room != 'lobby' ) { 
      socket.join(room); 
      let obj = Room_GameData.get(room);
      if ( !obj.colorMap.has(name) ) {
        obj.colorMap.set(name, giveUniqColor(obj.colorMap) );
        Room_GameData.set( room, obj );
      }
    }
      // if destination is not lobby, join room and assign color

    if (room != 'lobby') addPlayer(room, name);
      // make list of players in this room

    io.emit('update names', MapToArray(Name_Room, "name", "room"));
    io.to(room).emit('update player list', Room_PlayerArr.get(room) );

  });   // _______ JOIN ROOM (END) ________________________________________




  // _______ UPDATE PLAYER LIST ________________________________________

  socket.on('update player list', (room,playerArr) => {
    Room_PlayerArr.set(room, playerArr);
    io.to(room).emit('update player list', playerArr );

  });   // _______ UPDATE PLAYER LIST (END) ______________________________________









});   // END OF IO.ON() ______________________________________











// ____________________________ THE SOCKET.IO ENVIRONMENT (END)

// START LISTENING TO PORT ____________________________________

app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

