

// INITIAL SETUP ______________________________________________

const PORT = process.env.PORT || 3000;

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const _ = require('underscore');
// const { mapObject } = require('underscore');
// const { timingSafeEqual } = require('crypto');
// const { has } = require('underscore');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);












// ________________________________________ INITIAL SETUP (END)

//  MM      MM    MMMM    MMMMMM    MMMMMM    MMMM    MMMMMM    MM      MMMMMMMM    MMMM    
//  MM      MM  MM    MM  MM    MM    MM    MM    MM  MM    MM  MM      MM        MM    MM  
//  MM      MM  MMMMMMMM  MMMMMM      MM    MMMMMMMM  MMMMMM    MM      MMMMMMMM    MM      
//  MM      MM  MM    MM  MM    MM    MM    MM    MM  MM    MM  MM      MM            MM    
//    MM  MM    MM    MM  MM    MM    MM    MM    MM  MM    MM  MM      MM        MM    MM  
//      MM      MM    MM  MM    MM  MMMMMM  MM    MM  MMMMMM    MMMMMM  MMMMMMMM    MMMM    

// LOCAL VARIABLES ____________________________________________

var ID_Name = new Map();
var Name_Room = new Map();
var Room_GameData = new Map();
var Room_PlayerArr = new Map();
var Room_Score = new Map();

const nameSuffix = [', stop', 'ster', 'ette', 'ness', 'man', 'lord', 'ie' ];
const roomSuffix = [', stop', 'wood', 'istan', 'ia', 'ville', 'town', 'land' ];
var colorSet = randomizeColorset();
  // For iterating through variations to avoid duplicates.

const boardDim = 6;
const noName = 'zz'
  // variables to synchronize to client











// ______________________________________ LOCAL VARIABLES (END)

//    MMMM    MMMMMM    MMMMMM  MMMMMMMM    MMMM    MMMMMM    MMMM    
//  MM    MM  MM    MM      MM  MM        MM    MM    MM    MM    MM  
//  MM    MM  MMMMMM        MM  MMMMMMMM  MM          MM      MM      
//  MM    MM  MM    MM      MM  MM        MM          MM        MM    
//  MM    MM  MM    MM      MM  MM        MM    MM    MM    MM    MM  
//    MMMM    MMMMMM    MMMM    MMMMMMMM    MMMM      MM      MMMM    

// OBJECT CONSTRUCTOR _________________________________________

function GameData() {
    this.colorObj = {};
      // Object : { 'joon' : black, 'monk': red, etc... }
    this.grid = [];
      // Array : [ 'noName', 'joon', 'noName', 'monk', etc... ]
}











// ___________________________________ OBJECT CONSTRUCTOR (END)

//  MMMMMMMM  MM    MM  MM    MM    MMMM    MMMMMM  MMMMMM    MMMM    MM    MM    MMMM    
//  MM        MM    MM  MMMM  MM  MM    MM    MM      MM    MM    MM  MMMM  MM  MM    MM  
//  MMMMMMMM  MM    MM  MM  MMMM  MM          MM      MM    MM    MM  MM  MMMM    MM      
//  MM        MM    MM  MM    MM  MM          MM      MM    MM    MM  MM    MM      MM    
//  MM        MM    MM  MM    MM  MM    MM    MM      MM    MM    MM  MM    MM  MM    MM  
//  MM          MMMM    MM    MM    MMMM      MM    MMMMMM    MMMM    MM    MM    MMMM    

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

function hasObjValue( obj, item ) { return Object.values(obj).includes(item); }

function hasObjKey( obj, key ) { return Object.keys(obj).includes(key); }


function giveUniqColor( obj ) {   
  let num = colorSet.length-1;
  while ( hasObjValue(obj,colorSet[num]) == true ) { num--; }
  return colorSet[num];
}


function randomizeColorset() {
  let arr = [];
  let alphanum = ['0', '6', '9', 'c', 'f'];
  while ( arr.length < 100 ) {
    let str = '#';
    while ( str.length < 4 ) { str += alphanum[Math.floor( Math.random() * 5 )]; }
    if ( !arr.includes(str) ) arr.push(str);
  }
  arr.push('#fff0');
  return arr;
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

//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM  MMMMMM  
//  MM    MM  MM    MM  MM    MM  MM  MM    MM          MM    
//    MM      MM    MM  MM        MMMM      MMMMMMMM    MM    
//      MM    MM    MM  MM        MM  MM    MM          MM    
//  MM    MM  MM    MM  MM    MM  MM    MM  MM          MM    
//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM    MM    

// THE SOCKET.IO ENVIRONMENT __________________________________

io.on('connection', (socket) => {
  
  console.log(`--------- ${socket.id} connected ----------`);
  socket.emit('synchronize variables', noName, boardDim);








//  MMMMMM    MMMMMM    MMMM      MMMM      MMMM    MM    MM  MM    MM  MMMMMMMM    MMMM    MMMMMM  
//  MM    MM    MM    MM    MM  MM    MM  MM    MM  MMMM  MM  MMMM  MM  MM        MM    MM    MM    
//  MM    MM    MM      MM      MM        MM    MM  MM  MMMM  MM  MMMM  MMMMMMMM  MM          MM    
//  MM    MM    MM        MM    MM        MM    MM  MM    MM  MM    MM  MM        MM          MM    
//  MM    MM    MM    MM    MM  MM    MM  MM    MM  MM    MM  MM    MM  MM        MM    MM    MM    
//  MMMMMM    MMMMMM    MMMM      MMMM      MMMM    MM    MM  MM    MM  MMMMMMMM    MMMM      MM    
  
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

    if ( Room_GameData.get(room) ) {
      let obj = Room_GameData.get(room);
      obj.grid.forEach( (v,i) => {
        if ( v == name ) obj.grid[i] = noName;
      });
      Room_GameData.get(room).grid = obj.grid;
      io.to(room).emit('update grid', obj.colorObj, obj.grid ); 
    }






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







//  MM    MM  MMMMMMMM  MM      MM      MM    MM    MMMM    MMMMMMMM  MMMMMM    
//  MMMM  MM  MM        MM      MM      MM    MM  MM    MM  MM        MM    MM  
//  MM  MMMM  MMMMMMMM  MM      MM      MM    MM    MM      MMMMMMMM  MMMMMM    
//  MM    MM  MM        MM  MM  MM      MM    MM      MM    MM        MM    MM  
//  MM    MM  MM        MM  MM  MM      MM    MM  MM    MM  MM        MM    MM  
//  MM    MM  MMMMMMMM    MM  MM          MMMM      MMMM    MMMMMMMM  MM    MM  

  
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







//    MMMM    MMMMMM    MMMMMMMM    MMMM    MMMMMM  MMMMMMMM      MMMMMM      MMMM      MMMM    MM      MM  
//  MM    MM  MM    MM  MM        MM    MM    MM    MM            MM    MM  MM    MM  MM    MM  MMMM  MMMM  
//  MM        MMMMMM    MMMMMMMM  MMMMMMMM    MM    MMMMMMMM      MMMMMM    MM    MM  MM    MM  MM  MM  MM  
//  MM        MM    MM  MM        MM    MM    MM    MM            MM    MM  MM    MM  MM    MM  MM      MM  
//  MM    MM  MM    MM  MM        MM    MM    MM    MM            MM    MM  MM    MM  MM    MM  MM      MM  
//    MMMM    MM    MM  MMMMMMMM  MM    MM    MM    MMMMMMMM      MM    MM    MMMM      MMMM    MM      MM  

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
    obj.colorObj[noName] = giveUniqColor(obj.colorObj);
    obj.colorObj[name] = giveUniqColor(obj.colorObj);
    obj.grid = emptyGrid( boardDim );
    Room_GameData.set( room, obj );
      // Initialize Room_GameData map...
      // ...and assign colors.

    

    io.emit('add roombox', room);
    io.emit('update names', MapToArray(Name_Room, "name", "room"));
    io.to(room).emit('update color', obj.colorObj );
    io.to(room).emit('update player list', Room_PlayerArr.get(room) );

  });   // _______ CREATE ROOM (END) ______________________________________







//  MM    MM  MMMMMM    MMMMMM      MMMM    MMMMMM  MMMMMMMM          MMMM      MMMM      MMMM    MMMMMM    MMMMMMMM  
//  MM    MM  MM    MM  MM    MM  MM    MM    MM    MM              MM    MM  MM    MM  MM    MM  MM    MM  MM        
//  MM    MM  MM    MM  MM    MM  MMMMMMMM    MM    MMMMMMMM          MM      MM        MM    MM  MMMMMM    MMMMMMMM  
//  MM    MM  MMMMMM    MM    MM  MM    MM    MM    MM                  MM    MM        MM    MM  MM    MM  MM        
//  MM    MM  MM        MM    MM  MM    MM    MM    MM              MM    MM  MM    MM  MM    MM  MM    MM  MM        
//    MMMM    MM        MMMMMM    MM    MM    MM    MMMMMMMM          MMMM      MMMM      MMMM    MM    MM  MMMMMMMM

  // _________ UPDATE SCORE ____________________________________________

  socket.on('update score', (room, scoreObj) => {
    updateScore(room, scoreObj);
  });   // _________ UPDATE SCORE (END) ____________________________________________








//    MMMM    MM      MMMMMM  MMMMMMMM  MM    MM  MMMMMM          MMMM    MMMMMM    MMMMMM  MMMMMM    
//  MM    MM  MM        MM    MM        MMMM  MM    MM          MM    MM  MM    MM    MM    MM    MM  
//  MM        MM        MM    MMMMMMMM  MM  MMMM    MM          MM        MMMMMM      MM    MM    MM  
//  MM        MM        MM    MM        MM    MM    MM          MM  MMMM  MM    MM    MM    MM    MM  
//  MM    MM  MM        MM    MM        MM    MM    MM          MM    MM  MM    MM    MM    MM    MM  
//    MMMM    MMMMMM  MMMMMM  MMMMMMMM  MM    MM    MM            MMMM    MM    MM  MMMMMM  MMMMMM    
  
  // _______ UPDATE GRID ON CLIENT ______________________________________

  socket.on('update grid on client', room => {
    
    let obj = Room_GameData.get(room);
    // let arrOfGrid = obj.grid;
    io.to(room).emit('update grid', obj.colorObj, obj.grid ); 

  });   // ___________ UPDATE GRID ON CLIENT (END) __________________________________








//    MMMM    MMMMMMMM  MMMMMM    MM      MM  MMMMMMMM  MMMMMM            MMMM    MMMMMM    MMMMMM  MMMMMM    
//  MM    MM  MM        MM    MM  MM      MM  MM        MM    MM        MM    MM  MM    MM    MM    MM    MM  
//    MM      MMMMMMMM  MMMMMM    MM      MM  MMMMMMMM  MMMMMM          MM        MMMMMM      MM    MM    MM  
//      MM    MM        MM    MM  MM      MM  MM        MM    MM        MM  MMMM  MM    MM    MM    MM    MM  
//  MM    MM  MM        MM    MM    MM  MM    MM        MM    MM        MM    MM  MM    MM    MM    MM    MM  
//    MMMM    MMMMMMMM  MM    MM      MM      MMMMMMMM  MM    MM          MMMM    MM    MM  MMMMMM  MMMMMM    
  
  // _______ UPDATE GRID ON SERVER ______________________________________

  socket.on('update grid on server', gridArr => {
    let name = ID_Name.get(socket.id);
    let room = Name_Room.get(name);
    let obj = Room_GameData.get(room);

    obj.grid = gridArr;
    Room_GameData.set(room, obj);

    io.to(room).emit('update grid', obj.colorObj, obj.grid ); 

  });   // _______ UPDATE GRID ON SERVER (END) ______________________________________










//  MMMMMM    MMMM    MMMMMM  MM    MM        MMMMMM      MMMM      MMMM    MM      MM  
//      MM  MM    MM    MM    MMMM  MM        MM    MM  MM    MM  MM    MM  MMMM  MMMM  
//      MM  MM    MM    MM    MM  MMMM        MMMMMM    MM    MM  MM    MM  MM  MM  MM  
//      MM  MM    MM    MM    MM    MM        MM    MM  MM    MM  MM    MM  MM      MM  
//      MM  MM    MM    MM    MM    MM        MM    MM  MM    MM  MM    MM  MM      MM  
//  MMMM      MMMM    MMMMMM  MM    MM        MM    MM    MMMM      MMMM    MM      MM  

  // _______ JOIN ROOM ________________________________________

  socket.on('join room', room => {
    
    let name = ID_Name.get(socket.id);
    let oldRoom = Name_Room.get(name);
      // save data for use in this function

    Name_Room.set(name, room);
    socket.leave(oldRoom);
      // Leave old room. It's important to do this before what follows.

    if (oldRoom != 'lobby') {
      console.log('---- leaving room -----');
      delPlayer(oldRoom, name);
      let obj = Room_GameData.get(oldRoom);
      obj.grid.forEach( (v,i) => {
        if ( v == name ) obj.grid[i] = noName;
      });
      Room_GameData.get(oldRoom).grid = obj.grid;
      io.to(oldRoom).emit('update grid', obj.colorObj, obj.grid ); 
    }
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

      

      if ( !hasObjKey(obj.colorObj, name) ) {
        obj.colorObj[name] = giveUniqColor(obj.colorObj);
        Room_GameData.set( room, obj );
      }

    }
      // if destination is not lobby, join room and assign color

    if (room != 'lobby') addPlayer(room, name);
      // make list of players in this room

    io.emit('update names', MapToArray(Name_Room, "name", "room"));
    io.to(room).emit('update player list', Room_PlayerArr.get(room) );

  });   // _______ JOIN ROOM (END) ________________________________________







//  MM    MM  MMMMMM    MMMMMM      MMMM    MMMMMM  MMMMMMMM        MMMMMM    MM        MMMM    MM      MM  MMMMMMMM  MMMMMM    
//  MM    MM  MM    MM  MM    MM  MM    MM    MM    MM              MM    MM  MM      MM    MM    MM  MM    MM        MM    MM  
//  MM    MM  MM    MM  MM    MM  MMMMMMMM    MM    MMMMMMMM        MM    MM  MM      MMMMMMMM      MM      MMMMMMMM  MMMMMM    
//  MM    MM  MMMMMM    MM    MM  MM    MM    MM    MM              MMMMMM    MM      MM    MM      MM      MM        MM    MM  
//  MM    MM  MM        MM    MM  MM    MM    MM    MM              MM        MM      MM    MM      MM      MM        MM    MM  
//    MMMM    MM        MMMMMM    MM    MM    MM    MMMMMMMM        MM        MMMMMM  MM    MM      MM      MMMMMMMM  MM    MM  

  // _______ UPDATE PLAYER LIST ________________________________________

  socket.on('update player list', (room,playerArr) => {
    Room_PlayerArr.set(room, playerArr);
    io.to(room).emit('update player list', playerArr );

  });   // _______ UPDATE PLAYER LIST (END) ______________________________________









});   // END OF IO.ON() ______________________________________











// ____________________________ THE SOCKET.IO ENVIRONMENT (END)

//  MM      MMMMMM    MMMM    MMMMMM  MMMMMMMM  MM    MM  
//  MM        MM    MM    MM    MM    MM        MMMM  MM  
//  MM        MM      MM        MM    MMMMMMMM  MM  MMMM  
//  MM        MM        MM      MM    MM        MM    MM  
//  MM        MM    MM    MM    MM    MM        MM    MM  
//  MMMMMM  MMMMMM    MMMM      MM    MMMMMMMM  MM    MM  

// START LISTENING TO PORT ____________________________________

app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

