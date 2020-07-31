
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

var playerLimit = 3;


const fadeTime = 500;
const boardRatio = 1.5;

var noName = '';
var boardDim = 0;










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
    let x = window.innerWidth - 314;
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



function setUpGrid( num ) {
    addSVGtoBoard(board, num);
}



function addOnclick_Square( elem, index ) {
    elem.onclick = () => {

        let data = gridArr[index];
        if (data == name) {
            gridArr[index] = noName;
        } else if (data == noName) {
            gridArr[index] = name;
        }

        updateLocalGrid( gridArr );
        
        GridArrToGame_Rox();

        socket.emit('update grid', gridArr);
    }
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
            socket.emit('join room', room);
            socket.emit('req grid update', room );
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
        room = 'lobby';
        socket.emit('join room', room);
        playerArr = [];
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
    if (playerArr.length < 2) return;
    let target = ( !name ) ? playerArr[1] : name;
    do { playerArr.push( playerArr.shift() ); 
    } while ( playerArr[0] != target );
    console.log(playerArr);
}














// _________________________________ LOCAL FUNCTIONS (END)

// EVENT HANDLERS ________________________________________

window.onresize = () => { resizeBoard(); }



pickName.onchange = () => {
    name = pickName.value;
    pickName.value = '';
    modal.style.display = "none";
    socket.emit('new user', name);
}






$('#room-name').on('change', () => {
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
    socket.emit('create room', room);
    socket.emit('req grid update', room );
    $('#boardFrame').fadeIn(fadeTime);
});



$('#room-name').on('focusout', () => {    
    $('#room-plus').show();
    $('#room-name').hide();
    $('#room-name').val('');
    updateButtons();
});













// ___________________________________ EVENT HANDLERS (END)

// SOCKET EVENTS __________________________________________



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



socket.on('update player list', arr => {
    playerArr = arr;
});




socket.on('res grid update', (arrOfNameColorMap, name_grid) => {
    let map = ArrToMap(arrOfNameColorMap, 'name', 'color');
    visualizeGrid(map, name_grid);
});






// ______________________________________ SOCKET EVENTS (END)

// __________________________________________EVERYTHING (END)