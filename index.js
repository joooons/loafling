

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












// ________________________________________ INITIAL SETUP (END)

//  MM      MM    MMMM    MMMMMM    MMMMMM    MMMM    MMMMMM    MM      MMMMMMMM    MMMM    
//  MM      MM  MM    MM  MM    MM    MM    MM    MM  MM    MM  MM      MM        MM    MM  
//  MM      MM  MMMMMMMM  MMMMMM      MM    MMMMMMMM  MMMMMM    MM      MMMMMMMM    MM      
//  MM      MM  MM    MM  MM    MM    MM    MM    MM  MM    MM  MM      MM            MM    
//    MM  MM    MM    MM  MM    MM    MM    MM    MM  MM    MM  MM      MM        MM    MM  
//      MM      MM    MM  MM    MM  MMMMMM  MM    MM  MMMMMM    MMMMMM  MMMMMMMM    MMMM    

// LOCAL VARIABLES ____________________________________________

var ID_Name = new Map();
  // Example:   ID_Name.get(socket.id) == 'joon'

var Name_Room = new Map();
  // Example:   Name_Room.get('joon') == 'area51'

var Room_GameData = new Map();
  // Example:   Room_GameData.get('area51').colorObj['joon'] == 'black'
  //            Room_GameData.get('narnia').grid == [ 'noName', 'joon', noName', ... ]

var Room_Config = new Map();
  // Example:   Room_Config.get('area51').dim == 19
  //            Room_Config.get('area51').playerLimit == 2
  //            Room_Config.get('area51').strict == false

var Room_PlayerArr = new Map();
  // Example:   Room_PlayerArr.get('narnia') == ['joon', 'monk', 'foo']

var Room_Score = new Map();
  // Example:   Room_Score.get('area51')['joon'] == 5

var Room_Open = new Map();
  // Example:   Room_Open.get('narnia').vacanct == true
  //            Room_Open.get('narnia').open == true

var Room_RoxReady = new Map();
  // Example:   Room_RoxReady.get('narnia') == false
  // This Map ensures that only one player at a time can make a move.


const nameSuffix = [', stop', 'ster', 'ette', 'ness', 'man', 'lord', 'ie' ];
const roomSuffix = [', stop', 'wood', 'istan', 'ia', 'ville', 'town', 'land' ];
var colorSet = [];
  // For iterating through variations to avoid duplicates.

const noName = '2v7hqljweblks';
  // Variables to synchronize to client.
  // Pretty arbitrary actually.












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
  // console.log('inside addPlayer() ');
  checkAndEmitVacancy(room);

}

function delPlayer(room, name) {
  let arr = Room_PlayerArr.get(room);
  Room_PlayerArr.set(room, _.without(arr, name) );

  // console.log('inside delPlayer() ');
  checkAndEmitVacancy(room);

}

function updateScore(room, scoreObj) {

  if ( !Room_Score.has(room) ) { 
    Room_Score.set(room, scoreObj); 
  } else {
    let obj = Room_Score.get(room);
    Object.keys(scoreObj).forEach( name => {
      obj[name] = scoreObj[name];
      if (obj[name] == -9999) delete obj[name];
    });
    Room_Score.set(room, obj);
  }
  
  io.to(room).emit('update score', Room_Score.get(room) );
}

function checkAndEmitVacancy(room) {

  if ( !Room_Config.get(room) ) return;

  let arr = Room_PlayerArr.get(room);
  let config = Room_Config.get(room);

  // console.log('Room_Config: ', Room_Config);

  if (arr.length == config.playerLimit) { Room_Open.get(room).vacant = false; } 
  else { Room_Open.get(room).vacant = true; }

  let vac = Room_Open.get(room).vacant;
  let open = Room_Open.get(room).open;

  if (vac&&open) { io.emit('announce room open', room); } 
  else { io.emit('announce room closed', room); }

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
  socket.emit('synchronize variables', noName);








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

    console.log(`--------- ( user: ${name} ) disconnected...`);
    console.log(`--------- ${ID_Name.size} users still connected`);

    let scoreObj = {};
    scoreObj[name] = -1;
    updateScore(room, scoreObj);
    
    delPlayer(room, name);

    if ( Room_GameData.get(room) ) {
      let obj = Room_GameData.get(room);
      obj.grid.forEach( (v,i) => { if ( v == name ) obj.grid[i] = noName; });
      Room_GameData.get(room).grid = obj.grid;
      io.to(room).emit('update grid', obj.colorObj, obj.grid ); 
    }

    if ( !hasMapValue(Name_Room, room) ) {
      io.emit('del roombox', room );
      Room_GameData.delete(room);
      Room_PlayerArr.delete(room);
      Room_Score.delete(room);
      Room_Open.delete(room);
      Room_RoxReady.delete(room);
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
    
    let name = avoidDuplicate( ID_Name, suggestedName, nameSuffix );
    if ( name != suggestedName ) { socket.emit('change name', name ); }

    ID_Name.set(socket.id, name);
    Name_Room.set(name, 'lobby');
    console.log(`--------- ${name} connected! --------------------------`);

    mapUniqValArr( Name_Room ).forEach( val => {
      if ( val == 'lobby' ) return;
      socket.emit('add roombox', val ); 
      checkAndEmitVacancy(val);
    });

    io.emit('update names', MapToArray(Name_Room, "name", "room"));
    
  });   // _______ NEW USER (END) _________________________________________









//  MMMMMM    MMMMMMMM    MMMMMM            MMMM    MMMMMM    MMMMMMMM    MMMM    MMMMMM  MMMMMMMM        MMMMMM      MMMM      MMMM    MM      MM  
//  MM    MM  MM        MM      MM        MM    MM  MM    MM  MM        MM    MM    MM    MM              MM    MM  MM    MM  MM    MM  MMMM  MMMM  
//  MMMMMM    MMMMMMMM  MM      MM        MM        MMMMMM    MMMMMMMM  MMMMMMMM    MM    MMMMMMMM        MMMMMM    MM    MM  MM    MM  MM  MM  MM  
//  MM    MM  MM        MM  MM  MM  aaaa  MM        MM    MM  MM        MM    MM    MM    MM              MM    MM  MM    MM  MM    MM  MM      MM  
//  MM    MM  MM        MM    MM          MM    MM  MM    MM  MM        MM    MM    MM    MM              MM    MM  MM    MM  MM    MM  MM      MM  
//  MM    MM  MMMMMMMM    MMMM  MM          MMMM    MM    MM  MMMMMMMM  MM    MM    MM    MMMMMMMM        MM    MM    MMMM      MMMM    MM      MM  

  // _______ REQUET TO CREATE ROOM __________________________________________________

  socket.on('request to create room', (roomName) => {
    let room = avoidDuplicate( Name_Room, roomName, roomSuffix );
    socket.emit('room creation granted', room);
  });   // _______ REQUEST TO CREATE ROOM (END) ______________________________________











//    MMMM    MMMMMM    MMMMMMMM    MMMM    MMMMMM  MMMMMMMM      MMMMMM      MMMM      MMMM    MM      MM  
//  MM    MM  MM    MM  MM        MM    MM    MM    MM            MM    MM  MM    MM  MM    MM  MMMM  MMMM  
//  MM        MMMMMM    MMMMMMMM  MMMMMMMM    MM    MMMMMMMM      MMMMMM    MM    MM  MM    MM  MM  MM  MM  
//  MM        MM    MM  MM        MM    MM    MM    MM            MM    MM  MM    MM  MM    MM  MM      MM  
//  MM    MM  MM    MM  MM        MM    MM    MM    MM            MM    MM  MM    MM  MM    MM  MM      MM  
//    MMMM    MM    MM  MMMMMMMM  MM    MM    MM    MMMMMMMM      MM    MM    MMMM      MMMM    MM      MM  

  // _______ CREATE ROOM __________________________________________________

  socket.on('create room', (room, configData) => {

    let name = ID_Name.get(socket.id);
    Name_Room.set(name, room);

    Room_RoxReady.set(room, true);
    console.log('Room_RoxReady: ', Room_RoxReady);

    Room_Open.set(room, { 'vacant':true, 'open':true });
    // console.log('415 ', Room_Open);
    Room_Config.set(room, configData);

    socket.join(room);    // You are first to join

    socket.emit('board config', Room_Config.get(room) );

    startPlayerList(room);
    addPlayer(room, name);
      // make list of players in this room

    let obj = new GameData;
    colorSet = randomizeColorset();
    obj.colorObj[noName] = giveUniqColor(obj.colorObj);
    obj.colorObj[name] = giveUniqColor(obj.colorObj);
    obj.grid = emptyGrid( Room_Config.get(room).dim );
    Room_GameData.set( room, obj );
      // Initialize Room_GameData map...
      // ...and assign colors.

    io.emit('add roombox', room );
    io.emit('update names', MapToArray(Name_Room, "name", "room"));
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










//  MMMMMM    MMMMMMMM    MMMMMM          MMMMMM    MM    MM  MMMMMM          MMMM    MMMMMM    MMMM    MM    MM  MMMMMMMM  
//  MM    MM  MM        MM      MM        MM    MM  MM    MM    MM          MM    MM    MM    MM    MM  MMMM  MM  MM        
//  MMMMMM    MMMMMMMM  MM      MM        MM    MM  MM    MM    MM            MM        MM    MM    MM  MM  MMMM  MMMMMMMM  
//  MM    MM  MM        MM  MM  MM  aaaa  MMMMMM    MM    MM    MM              MM      MM    MM    MM  MM    MM  MM        
//  MM    MM  MM        MM    MM          MM        MM    MM    MM          MM    MM    MM    MM    MM  MM    MM  MM        
//  MM    MM  MMMMMMMM    MMMM  MM        MM          MMMM      MM            MMMM      MM      MMMM    MM    MM  MMMMMMMM  

  // _______ REQUEST TO PUT STONE ______________________________________

  socket.on('request to put stone', (room,index) => {
    let name = ID_Name.get(socket.id);

    console.log('----------------------------------------------');
    // console.log(`<${name}> is requesting permission to play a stone.`);
    // console.log('Room_RoxReady.get(room) =', Room_RoxReady.get(room) );

    socket.emit('stone play request granted', Room_RoxReady.get(room), index );
    if ( Room_RoxReady.get(room) ) {
      Room_RoxReady.set(room, false); 
      console.log(`>> [Room:${room}] locked until <${name}> completes a move.`);
    } 

  });   // ___________ REQUEST TO PUT STONE (END) __________________________________









//  MMMMMM    MMMMMMMM    MMMM    MMMMMMMM  MMMMMM        MMMMMM      MMMM    MM      MM  MMMMMM    MMMMMMMM    MMMM    MMMMMM    MM      MM  
//  MM    MM  MM        MM    MM  MM          MM          MM    MM  MM    MM    MM  MM    MM    MM  MM        MM    MM  MM    MM    MM  MM    
//  MMMMMM    MMMMMMMM    MM      MMMMMMMM    MM          MMMMMM    MM    MM      MM      MMMMMM    MMMMMMMM  MMMMMMMM  MM    MM      MM      
//  MM    MM  MM            MM    MM          MM          MM    MM  MM    MM    MM  MM    MM    MM  MM        MM    MM  MM    MM      MM      
//  MM    MM  MM        MM    MM  MM          MM          MM    MM  MM    MM  MM      MM  MM    MM  MM        MM    MM  MM    MM      MM      
//  MM    MM  MMMMMMMM    MMMM    MMMMMMMM    MM          MM    MM    MMMM    MM      MM  MM    MM  MMMMMMMM  MM    MM  MMMMMM        MM      

// ___________________ RESET ROX_READY ___________________________________________

socket.on('reset Rox_Ready', room => {
  let name = ID_Name.get(socket.id);

  Room_RoxReady.set(room, true); 
  console.log(`>> <${name}> played a move. [Room:${room}] is now ready for the next player.`);

});   // ___________ RESET ROX_READY (END) _______________________________________









//    MMMM    MM      MMMMMM  MMMMMMMM  MM    MM  MMMMMM          MMMM    MMMMMM    MMMMMM  MMMMMM    
//  MM    MM  MM        MM    MM        MMMM  MM    MM          MM    MM  MM    MM    MM    MM    MM  
//  MM        MM        MM    MMMMMMMM  MM  MMMM    MM          MM        MMMMMM      MM    MM    MM  
//  MM        MM        MM    MM        MM    MM    MM          MM  MMMM  MM    MM    MM    MM    MM  
//  MM    MM  MM        MM    MM        MM    MM    MM          MM    MM  MM    MM    MM    MM    MM  
//    MMMM    MMMMMM  MMMMMM  MMMMMMMM  MM    MM    MM            MMMM    MM    MM  MMMMMM  MMMMMM    
  
  // _______ UPDATE GRID ON CLIENT ______________________________________

  socket.on('update grid on client', room => {
    let obj = Room_GameData.get(room);
    io.to(room).emit('update grid', obj.colorObj, obj.grid ); 
  });   // ___________ UPDATE GRID ON CLIENT (END) __________________________________








//    MMMM    MMMMMMMM  MMMMMM    MM      MM  MMMMMMMM  MMMMMM            MMMM    MMMMMM    MMMMMM  MMMMMM    
//  MM    MM  MM        MM    MM  MM      MM  MM        MM    MM        MM    MM  MM    MM    MM    MM    MM  
//    MM      MMMMMMMM  MMMMMM    MM      MM  MMMMMMMM  MMMMMM          MM        MMMMMM      MM    MM    MM  
//      MM    MM        MM    MM  MM      MM  MM        MM    MM        MM  MMMM  MM    MM    MM    MM    MM  
//  MM    MM  MM        MM    MM    MM  MM    MM        MM    MM        MM    MM  MM    MM    MM    MM    MM  
//    MMMM    MMMMMMMM  MM    MM      MM      MMMMMMMM  MM    MM          MMMM    MM    MM  MMMMMM  MMMMMM    
  
  // _______ UPDATE GRID ON SERVER ______________________________________

  socket.on('update grid on server', (gridArr, banNext) => {
    let name = ID_Name.get(socket.id);
    let room = Name_Room.get(name);
    let obj = Room_GameData.get(room);
    
    obj.grid = gridArr;
    Room_GameData.set(room, obj);
    io.to(room).emit('update grid', obj.colorObj, obj.grid, banNext ); 
    
  });   // _______ UPDATE GRID ON SERVER (END) ______________________________________





  



//  MMMMMM    MMMMMMMM    MMMMMM          MMMMMM    MMMM    MMMMMM  MM    MM        MMMMMM      MMMM      MMMM    MM      MM  
//  MM    MM  MM        MM      MM            MM  MM    MM    MM    MMMM  MM        MM    MM  MM    MM  MM    MM  MMMM  MMMM  
//  MMMMMM    MMMMMMMM  MM      MM            MM  MM    MM    MM    MM  MMMM        MMMMMM    MM    MM  MM    MM  MM  MM  MM  
//  MM    MM  MM        MM  MM  MM  aaaa      MM  MM    MM    MM    MM    MM        MM    MM  MM    MM  MM    MM  MM      MM  
//  MM    MM  MM        MM    MM              MM  MM    MM    MM    MM    MM        MM    MM  MM    MM  MM    MM  MM      MM  
//  MM    MM  MMMMMMMM    MMMM  MM        MMMM      MMMM    MMMMMM  MM    MM        MM    MM    MMMM      MMMM    MM      MM  

  // _______ REQUEST TO JOIN ROOM ____________________________________________________

  socket.on('request to join room', room => {

    // console.log('inside request to join room');
    checkAndEmitVacancy(room);

    let vac = Room_Open.get(room).vacant;
    let open = Room_Open.get(room).open;

    if ( vac&&open) { socket.emit('entry granted', true, Room_Config.get(room) ); } 
    else { socket.emit('entry granted', false, Room_Config.get(room) ); }

  });   // _______ REQUEST TO JOIN ROOM (END) ________________________________________









//  MMMMMM    MMMM    MMMMMM  MM    MM        MMMMMM      MMMM      MMMM    MM      MM  
//      MM  MM    MM    MM    MMMM  MM        MM    MM  MM    MM  MM    MM  MMMM  MMMM  
//      MM  MM    MM    MM    MM  MMMM        MMMMMM    MM    MM  MM    MM  MM  MM  MM  
//      MM  MM    MM    MM    MM    MM        MM    MM  MM    MM  MM    MM  MM      MM  
//      MM  MM    MM    MM    MM    MM        MM    MM  MM    MM  MM    MM  MM      MM  
//  MMMM      MMMM    MMMMMM  MM    MM        MM    MM    MMMM      MMMM    MM      MM  

  // _______ JOIN ROOM ____________________________________________________

  socket.on('join room', room => {
    
    let name = ID_Name.get(socket.id);
    let oldRoom = Name_Room.get(name);
      // save data for use in this function

    Name_Room.set(name, room);
    socket.leave(oldRoom);
      // Leave old room. It's important to do this before what follows.

    if (oldRoom != 'lobby') {
      // If you are leaving a room, not leaving the lobby...
      // ...you have to clean up your stones...
      // ...and sign off your name out of the room.
      console.log(`---- ${name} left room ${oldRoom} -----`);
      delPlayer(oldRoom, name);
      let obj = Room_GameData.get(oldRoom);
      obj.grid.forEach( (v,i) => {
        if ( v == name ) obj.grid[i] = noName;
      });
      Room_GameData.get(oldRoom).grid = obj.grid;
      io.to(oldRoom).emit('update grid', obj.colorObj, obj.grid ); 
    }

    if ( !hasMapValue(Name_Room, oldRoom) ) {
      // IF the room no longer exists...
      // ...you have to delete all traces of it.
      io.emit('del roombox', oldRoom );
      Room_GameData.delete(oldRoom);
      Room_PlayerArr.delete(oldRoom);
      Room_Score.delete(oldRoom);
      Room_Open.delete(oldRoom);
      Room_RoxReady.delete(oldRoom);
    } else {
      // but if someone is still in the room...
      // ...you have to keep updating the player list.
      io.to(oldRoom).emit('update player list', Room_PlayerArr.get(oldRoom) );
    }
      

    if ( room != 'lobby' ) { 
      // If the destination is not the lobby...
      // "join" the socket room and assign color.

      socket.emit('board config', Room_Config.get(room) );      
      socket.join(room); 

      let obj = Room_GameData.get(room);
      if ( !hasObjKey(obj.colorObj, name) ) {
        obj.colorObj[name] = giveUniqColor(obj.colorObj);
        Room_GameData.set( room, obj );
      }
      addPlayer(room, name);

    }

    io.emit('update names', MapToArray(Name_Room, "name", "room"));
    io.to(room).emit('update player list', Room_PlayerArr.get(room) );

  });   // _______ JOIN ROOM (END) ________________________________________








//    MMMM    MM    MM  MM    MM    MMMM    MM    MM  MM    MM    MMMM    MMMMMMMM          MMMM    MM        MMMM      MMMM    MM    MM  MMMMMM    MMMMMMMM  
//  MM    MM  MMMM  MM  MMMM  MM  MM    MM  MM    MM  MMMM  MM  MM    MM  MM              MM    MM  MM      MM    MM  MM    MM  MM    MM  MM    MM  MM        
//  MMMMMMMM  MM  MMMM  MM  MMMM  MM    MM  MM    MM  MM  MMMM  MM        MMMMMMMM        MM        MM      MM    MM    MM      MM    MM  MMMMMM    MMMMMMMM  
//  MM    MM  MM    MM  MM    MM  MM    MM  MM    MM  MM    MM  MM        MM              MM        MM      MM    MM      MM    MM    MM  MM    MM  MM        
//  MM    MM  MM    MM  MM    MM  MM    MM  MM    MM  MM    MM  MM    MM  MM              MM    MM  MM      MM    MM  MM    MM  MM    MM  MM    MM  MM        
//  MM    MM  MM    MM  MM    MM    MMMM      MMMM    MM    MM    MMMM    MMMMMMMM          MMMM    MMMMMM    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM  

  // _______ ANNOUNCE CLOSURE _________________________________________________

  socket.on('announce closure', (room) => {
    Room_Open.get(room).open = false;
    // console.log('inside announce closure');
    checkAndEmitVacancy(room);
  });   // _______ ANNOUNCE CLOSURE (END) ______________________________________









//  MM    MM  MMMMMM    MMMMMM      MMMM    MMMMMM  MMMMMMMM        MMMMMM    MM        MMMM    MM      MM  MMMMMMMM  MMMMMM    
//  MM    MM  MM    MM  MM    MM  MM    MM    MM    MM              MM    MM  MM      MM    MM    MM  MM    MM        MM    MM  
//  MM    MM  MM    MM  MM    MM  MMMMMMMM    MM    MMMMMMMM        MM    MM  MM      MMMMMMMM      MM      MMMMMMMM  MMMMMM    
//  MM    MM  MMMMMM    MM    MM  MM    MM    MM    MM              MMMMMM    MM      MM    MM      MM      MM        MM    MM  
//  MM    MM  MM        MM    MM  MM    MM    MM    MM              MM        MM      MM    MM      MM      MM        MM    MM  
//    MMMM    MM        MMMMMM    MM    MM    MM    MMMMMMMM        MM        MMMMMM  MM    MM      MM      MMMMMMMM  MM    MM  

  // _______ UPDATE PLAYER LIST _________________________________________________

  socket.on('update player list', (room,playerArr) => {
    Room_PlayerArr.set(room, playerArr);
    io.to(room).emit('update player list', playerArr );

  });   // _______ UPDATE PLAYER LIST (END) ______________________________________








//  MM    MM  MMMMMM    MMMMMM      MMMM    MMMMMM  MMMMMMMM        MMMMMM      MMMM      MMMM      MMMM    
//  MM    MM  MM    MM  MM    MM  MM    MM    MM    MM              MM    MM  MM    MM  MM    MM  MM    MM  
//  MM    MM  MM    MM  MM    MM  MMMMMMMM    MM    MMMMMMMM        MM    MM  MMMMMMMM    MM        MM      
//  MM    MM  MMMMMM    MM    MM  MM    MM    MM    MM              MMMMMM    MM    MM      MM        MM    
//  MM    MM  MM        MM    MM  MM    MM    MM    MM              MM        MM    MM  MM    MM  MM    MM  
//    MMMM    MM        MMMMMM    MM    MM    MM    MMMMMMMM        MM        MM    MM    MMMM      MMMM    

    // _______ UPDATE PASS ___________________________________________________

    socket.on('update pass', (room, passCount) => {
      io.to(room).emit('update pass', passCount );
    });   // _______ UPDATE PASS (END) ______________________________________








//    MMMM    MM    MM    MMMM    MM    MM  MMMMMM  
//  MM    MM  MM    MM  MM    MM  MM    MM    MM    
//    MM      MMMMMMMM  MM    MM  MM    MM    MM    
//      MM    MM    MM  MM    MM  MM    MM    MM    
//  MM    MM  MM    MM  MM    MM  MM    MM    MM    
//    MMMM    MM    MM    MMMM      MMMM      MM    
    
    // _______ SHOUT ________________________________________________________

    socket.on('shout', (room, str) => {
      socket.to(room).broadcast.emit('shout', str );
    });   // _______ SHOUT (END) ____________________________________________





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

