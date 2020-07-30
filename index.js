

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

const boardDim = 5;
const noName = 'zz'

const nameSuffix = [', stop', 'ster', 'ette', 'ness', 'man', 'lord', 'ie' ];
const roomSuffix = [', stop', 'wood', 'istan', 'ia', 'ville', 'town', 'land' ];
const colorSet = ['violet', 'chartreuse', 'skyblue', 'pink', 'white', 'black', '#FFF0'];










// ______________________________________ LOCAL VARIABLES (END)

// OBJECT CONSTRUCTOR__________________________________________

function GameData() {
    this.colorMap = new Map();
    this.grid = [];
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










// ______________________________________ LOCAL FUNCTIONS (END)

// THE SOCKET.IO ENVIRONMENT __________________________________

io.on('connection', (socket) => {
  
  console.log(`----- ${socket.id} connected --------------`);

  socket.emit('synchronize variables', noName, boardDim);


  // let thing = new GameData();
  //   thing.colorMap.set('monk', 'red');
  //   thing.colorMap.set('joon', 'blue');
  //   thing.grid = [1,3,5];
  // socket.emit('send thing', MapToArray(thing.colorMap, 'name', 'color'), thing.grid);


  
  // _______ DISCONNECT _______________________________________

  socket.on('disconnect', () => {
    let name = ID_Name.get(socket.id);
    let oldRoom = Name_Room.get(name);

    Name_Room.delete(name);
    ID_Name.delete(socket.id);

    console.log(`( user: ${name} ) disconnected...`);
    console.log(`${ID_Name.size} users still connected`);

    if ( !hasMapValue(Name_Room, oldRoom) ) {
      io.emit('del roombox', oldRoom );
      Room_GameData.delete(oldRoom);
    }

    io.emit('update names', MapToArray(Name_Room, "name", "room"));
  
  });




  
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
    
  });




  
  // _______ CREATE ROOM ______________________________________

  // WHEN USER CREATES A ROOM
  socket.on('create room', roomName => {

    let room = avoidDuplicate( Name_Room, roomName, roomSuffix );
    if ( room != roomName ) { socket.emit('change room name', room ); }

    let name = ID_Name.get(socket.id);
    Name_Room.set(name, room);
    socket.join(room);

    let obj = new GameData;

    obj.colorMap.set(noName, giveUniqColor(obj.colorMap) );
    obj.colorMap.set(name, giveUniqColor(obj.colorMap) );

    obj.grid = emptyGrid( boardDim );
    Room_GameData.set( room, obj );

    io.emit('add roombox', room);
    io.emit('update names', MapToArray(Name_Room, "name", "room"));

  });



  
  // _______ REQ GRID UPDATE __________________________________

  socket.on('req grid update', room => {
    
    let obj = Room_GameData.get(room);
    let arrOfMap = MapToArray( obj.colorMap, 'name', 'color');
    let arrOfGrid = obj.grid;
    io.to(room).emit('res grid update', arrOfMap, arrOfGrid ); 
  });






  
  // _______ UPDATE GRID ______________________________________

  socket.on('update grid', gridArr => {
    let name = ID_Name.get(socket.id);
    let room = Name_Room.get(name);

    let obj = Room_GameData.get(room);
    obj.grid = gridArr;
    Room_GameData.set(room, obj);

    let arrOfMap = MapToArray( obj.colorMap, 'name', 'color');
    let arrOfGrid = obj.grid;

    io.to(room).emit('res grid update', arrOfMap, arrOfGrid ); 
  });





  
  // _______ JOIN ROOM ________________________________________


  socket.on('join room', room => {
    let name = ID_Name.get(socket.id);
    let oldRoom = Name_Room.get(name);

    Name_Room.set(name, room);

    socket.leave(oldRoom);

    if ( room != 'lobby' ) { 
      socket.join(room); 
      let obj = Room_GameData.get(room);
      console.log(obj.colorMap);
      if ( !obj.colorMap.has(name) ) {
        console.log('name not on list yet');
        obj.colorMap.set(name, giveUniqColor(obj.colorMap) );
        Room_GameData.set( room, obj );
      }
    }
    
    if ( !hasMapValue(Name_Room, oldRoom) ) {
      io.emit('del roombox', oldRoom );
      Room_GameData.delete(oldRoom);
    }

    

    io.emit('update names', MapToArray(Name_Room, "name", "room"));

    displayName_Room('update names');

  });



});   // END OF IO.ON() ______________________________________










// ____________________________ THE SOCKET.IO ENVIRONMENT (END)

// START LISTENING TO PORT ____________________________________

app.use(express.static(path.join(__dirname, 'public') ) );
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

