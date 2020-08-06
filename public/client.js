
const socket = io();








// LOCAL VARIABLES ________________________________________

var name = 'none';
var room = 'lobby';
    // Starting room is always specifically the 'lobby'

var gridArr = [];
    // The array of names assigned to the board grid.
    // Only for the room that the player is currently connected to.

var playerArr = [];
    // The local array of names of players in the current room, in order of entry.
    // Corresponds to Room_PlayerArr map in index.js.
    // But this one is specific to just the current room.
    // Also, the order changes to .... actually...

var scoreObj = {};
    // The local object that contains the score of all players in the room.
    // Associated with Room_Score object in index.js


const playerLimit = 4;
const fadeTime = 500;
const boardRatio = 1.5;



var noName;
var boardDim;










// DOM ELEMENTS ___________________________________________

const modal = document.querySelector('#modal');
const pickName = document.querySelector('#pick-name');

const lobbySpace = document.querySelector('#lobbySpace');
const roomSpace = document.querySelector('#roomSpace');
const boardSpace = document.querySelector('#boardSpace');
const boardFrame = document.querySelector('#boardFrame');

const board = document.querySelector('#board');














// INITIAL CONDITIONS ________________________________________

resizeBoard();

allowCreateRooms();

$('#boardFrame').fadeOut(0, () => { $('#boardFrame').css('visibility', 'visible'); });

$('#room-name').hide(0, () => { $('#room-name').css('visibility', 'visible'); });

socket.on('board config', dim => { setUpGrid( dim ); });












// LOCAL FUNCTIONS ____________________________________________

function resizeBoard() {
    let x = window.innerWidth - 240;
    let y = window.innerHeight - 30;
    let board_x, board_y;
    let windowRatio = x / y;

    if ( windowRatio < boardRatio ) {
        board_x = x;
        board_y = x / boardRatio;
    } else {
        board_x = y * boardRatio;
        board_y = y;
    }
    
    let dim = board_y - 40;

    boardFrame.style.width = board_x + 'px';
    boardFrame.style.height = board_y + 'px';
    board.style.width = dim + 'px';
    board.style.height = dim + 'px';
}


function createRoom() {
    let reg = /[\s\"\']/;
    if ( reg.test( $('#room-name').val() ) ) {
        $('#room-name').attr('placeholder', 'no spaces!');
        $('#room-name').val('');
        return;    
    }
    room = $('#room-name').val();

    $('#room-name').val('');
    $('#room-name').attr('placeholder', 'room name');
    $('#room-plus').show();
    $('#room-name').hide();

    emit.createRoom(room);

    emit.updateClientGrid(room);

    scoreObj[name] = 0;
    emit.updateScore(room, scoreObj);

    $('#boardFrame').fadeIn(fadeTime);
}


function setUpGrid( num ) {
    addSVGtoBoard(board, num);
}



function addOnclick_Square( elem, index ) {
    elem.onclick = () => {

        let data = gridArr[index];
        if (data == name) { gridArr[index] = noName; } 
        else if (data == noName) { gridArr[index] = name; }

        updateLocalGrid( gridArr );
        GridArrToGame_Rox();

        shiftPlayerList(name);
        shiftPlayerList();
            // First, reset order. Then go to next player.

        if ( gridArr[index] == name ) {
            calculateAttack(index);
            changeScore();
        }

        emit.updateServerGrid(gridArr);
    }
}

 


function calculateAttack(indexValue) {

    if (playerArr.length < 2) return;
    console.log('--- attack!!! ---');

    let pos = indexValue + 1;
    let wallIndex = [];
    let attackSucceeded = false;
    
    let roster = [...playerArr];
        // Temporary list of players, starting with first victim.
        // Includes player who attacked.

    console.clear();


    roster.forEach( victim => {
        if ( !Game_Rox[victim] ) return;
        if ( victim == name ) return;

        let walls = Game_Rox[victim].walls;
        let killList = [];

        walls.forEach( (wall,i) => { if (wall.includes(pos)) wallIndex.push(i); });
        
        wallIndex.forEach( i => {
            let count = 0;
            let team = Game_Rox[victim].teams[i];
            let wall = walls[i];
            wall.forEach( posValue => {
                if (_.without(roster, victim).includes( gridArr[posValue-1])) count++;
            });
            if ( count == walls[i].length ) {
                scoreObj[name] += team.length;
                attackSucceeded = true;
                killList.push(i);
            }                
        });

        killList.forEach( i => {
            let teams = Game_Rox[victim].teams;
            let team = teams[i];
            team.forEach( posValue => {
                let index = posValue -1;
                gridArr[index] = noName;
            });
        });

        GridArrToGame_Rox();
        wallIndex = [];

    });     // END of roster.forEach( victim => {...} 

    if ( !attackSucceeded ) {
        
        let teams = Game_Rox[name].teams;
        let index = 9999;

        teams.forEach( (team,i) => { if (team.includes(pos)) index = i; });
        
        let count = 0;
        let wall = Game_Rox[name].walls[index];

        wall.forEach( val => {
            if (_.without(roster, name).includes( gridArr[val-1])) count++;
        });


        if (count == wall.length) {
            gridArr[pos-1] = noName;
            GridArrToGame_Rox();
            shiftPlayerList(name);
        }
        
    }       // END of if ( !attackSucceeded ) {...}



    
}



function changeScore() {
    // However way you calculate the score.
    // It can't be this simple...
    
    // scoreObj[name]++;
    emit.updateScore(room, scoreObj);
}







function updateLocalGrid( grid ) {
    gridArr = grid;
    GridArrToGame_Rox();
}


function visualizeGrid( color_map, name_grid ) {
    name_grid.forEach( ( _name, i) => {
        let color = color_map.get( _name );
        $('.square').eq(i).css('fill', color );
    });
    updateLocalGrid( name_grid );
}


function ArrToMap( arr, keyStr, valStr ) {
    let newMap = new Map();
    arr.forEach( obj => {
        newMap.set(obj[keyStr], obj[valStr]);
    });
    return newMap;
}


function allowCreateRooms() {
    $('#room-plus').html('<b>+</b>');
    $('#room-plus').show();
    $('#room-plus').css('cursor', 'pointer');
    $('#room-name').hide(fadeTime);
    $('#room-plus').on('click', () => {
        $('#room-plus').hide();
        $('#room-name').show(fadeTime);
        $('#room-name').focus();
        onlyThisButtonLeave('--------');
    });
}


function denyCreateRooms() {
    $('#room-plus').html('<b>x</b>');
    $('#room-plus').css('cursor', 'default');
    $('#room-plus').off('click');
}


function allButtonsJoin() {
    let num = $(`button[id^="bt-"]`).length;
    for ( i=0 ; i<num ; i++ ) {
        $(`button[id^="bt-"]`).eq(i).show();
        let str = $(`button[id^="bt-"]`).eq(i).attr('id');
        addOnclick_JOIN(`#${str}`);
    }
}


function onlyThisButtonLeave( room ) {
    let num = $(`button[id^="bt-"]`).length;
    for ( i=0 ; i<num ; i++ ) {
        $(`button[id^="bt-"]`).eq(i).hide();
    }
    addOnclick_LEAVE(`#bt-${room}`);
    $(`#bt-${room}`).show();
}


function updateButtons() {
    if ( room == 'lobby' ) {
        allowCreateRooms();
        allButtonsJoin();
    } else {
        denyCreateRooms();
        onlyThisButtonLeave(room);
    }
}


function addRoomBox( room ) {
    $('#roomSpace').append(`<div id="rb-${room}"></div>`);
    $(`#rb-${room}`).append(`<b>${room}</b><br>`);
    $(`#rb-${room}`).append(`<button id="bt-${room}">JOIN</button>`);
    $(`#rb-${room}`).append(`<div id="rm-${room}"></div>`);
}


function delRoomBox( room ) {
    $(`#rb-${room}`).remove();
}


function addOnclick_JOIN( roomName ) {
    $(roomName).html('JOIN');
    $(roomName).off('click');
    $(roomName).on('click', () => {
        room = roomName.slice(4);
        let playerNum = $(`#rm-${room} >`).length;
        if ( playerNum < playerLimit ) {

            emit.joinRoom(room);

    
            scoreObj[name] = 0;
            emit.updateScore(room, scoreObj);

            emit.updateClientGrid(room);

            $('#boardFrame').fadeIn(fadeTime);
            updateButtons();
        } else {
            alert('room full');
        }
    });
}


function addOnclick_LEAVE( roomName ) {
    $(roomName).html('LEAVE');
    $(roomName).off('click');
    $(roomName).on('click', () => {
        oldRoom = room;
        room = 'lobby';
        
        scoreObj[name] = -1;        // -1 designated as sign of leaving.
        emit.updateScore(room, scoreObj)

        emit.joinRoom(room);

        playerArr = [];
        scoreObj = {};
        updateButtons();
        $('#boardFrame').fadeOut(fadeTime);
    });
}


function updateNames( arrayOfObject ) {
    let num = $('div[id^="rm-"]').length;
    for ( i=0 ; i<num ; i++ ) { $('div[id^="rm-"]').eq(i).html(''); }
    arrayOfObject.forEach( obj => {
        let [a, b, c ] = ['', obj.name, ''];
        if (name == obj.name) [a,c] = [ 'class="me"', ' (me)'];
        $(`div[id="rm-${obj.room}"]`).append(`<div ${a}>${b} ${c}</div>`);
    });
}


function shiftPlayerList(name) {
    if ( !playerArr.includes(name) && name ) return console.log('name not on list');
    if (playerArr.length < 2) return;
    let target = ( !name ) ? playerArr[1] : name;
    do { playerArr.push( playerArr.shift() ); 
    } while ( playerArr[0] != target );

    emit.updatePlayerList(room, playerArr);

}














// _________________________________ LOCAL FUNCTIONS (END)

// EVENT HANDLERS ________________________________________

window.onresize = () => { resizeBoard(); }


pickName.onchange = () => {
    name = pickName.value;
    pickName.value = '';
    modal.style.display = "none";
    emit.newUser(name);

}


$('#room-name').on('change', () => {
    createRoom();
});


$('#room-name').on('focusout', () => {    
    $('#room-plus').show();
    $('#room-name').hide();
    $('#room-name').val('');
    updateButtons();
});













// ___________________________________ EVENT HANDLERS (END)

// SOCKET EMIT EVENTS _____________________________________

var emit = {
    newUser : (name) => { socket.emit('new user', name); },
    createRoom : (room) => { socket.emit('create room', room); },
    joinRoom : (room) => { socket.emit('join room', room); },
    updatePlayerList : (room, playerArr) => {socket.emit('update player list', room, playerArr ); },
    updateClientGrid : (room) => { socket.emit('update grid on client', room ); },
    updateScore : (room, scoreObj) => { socket.emit('update score', room, scoreObj); },
    updateServerGrid : (gridArr) => { socket.emit('update grid on server', gridArr); }    
    
}



// _______________________________ SOCKET EMIT EVENTS (END)

// SOCKET ON EVENTS _______________________________________

socket.on('synchronize variables', (blankName, dim) => {
    noName = blankName;
    boardDim = dim;
});


socket.on('change name', newName => {
    name = newName;
});


socket.on('change room name', roomName => {
    room = roomName;
});


socket.on('add roombox', roomName => {
    addRoomBox( roomName );
    updateButtons();
});


socket.on('del roombox', roomName => {
    delRoomBox( roomName );
});


socket.on('update names', arr => {
    updateNames( arr );
});


socket.on('update player list', updatedPlayerList => {

    playerArr = updatedPlayerList;
    let str = `<div>${updatedPlayerList[0]}'s turn!</div>`;
    $('#turn').html(str);
});


socket.on('update grid', (arrOfNameColorMap, name_grid) => {
    let map = ArrToMap(arrOfNameColorMap, 'name', 'color');
    map.forEach( (val, key) => {
        $(`#color-${key}`).css('color', val);
    });
    visualizeGrid(map, name_grid);
});


socket.on('update score', obj => {
    scoreObj = obj;    
    let str = '';
    Object.keys(obj).forEach( key => {
        str += `<div><span id="color-${key}">&#11044;</span> ${key}: ${obj[key]}</div>`
    });
    $('#players').html(str);
});


// ___________________________________ SOCKET ON EVENTS (END)

// __________________________________________EVERYTHING (END)