


const socket = io();



// LOCAL VARIABLES ________________________________________

var name = 'none';
var room = 'lobby';

const fadeTime = 500;









// DOM ELEMENTS ___________________________________________

const modal = document.querySelector('#modal');
const pickName = document.querySelector('#pick-name');

const lobbySpace = document.querySelector('#lobbySpace');
const roomSpace = document.querySelector('#roomSpace');
const boardSpace = document.querySelector('#boardSpace');

const board = document.querySelector('#board');











// INITIAL CONDITIONS ________________________________________

resizeBoard();

allowCreateRooms();

$(board).fadeOut(0, () => { $(board).css('visibility', 'visible'); });

$('#room-name').hide(0, () => { $('#room-name').css('visibility', 'visible'); });

socket.on('board config', dim => { setUpGrid( dim ); });










// LOCAL FUNCTIONS ____________________________________________

function resizeBoard() {
    let x = window.innerWidth - 340;
    let y = window.innerHeight - 40;
    let dim = Math.min(x, y);
    board.style.width = dim + 'px';
    board.style.height = dim + 'px';
}



function setUpGrid( num ) {
    let str = `repeat(${num}, auto)`;
    $(board).css('grid-template-columns', str);
    for ( i=1 ; i<=Math.pow(num, 2) ; i++ ) {
        let num = i;
        let elem = document.createElement('div');
        elem.setAttribute('class', 'square');
        elem.innerText = num;
        elem.style.background = "yellow";

        elem.onclick = ev => {
            let color = ev.target.style.backgroundColor;
            color = (color != "yellow") ? "yellow" : "skyblue";
            ev.target.style.background = color;
            console.log(num, color);
        }

        $(board).append(elem);
    }
}



function updateGrid( arr ) {
    arr.forEach( (val, i) => {
        $('#board >').eq(i).css('background', arr[i] );
    });
}



// function ArrToMap( arr, keyStr, valStr ) {
//     let newMap = new Map();
//     arr.forEach( obj => {
//         newMap.set(obj[keyStr], obj[valStr]);
//     });
//     return newMap;
// }



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
    $(`#rb-${room}`).append(`<b>${room}</b><hr>`);
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
        socket.emit('join room', room);
        socket.emit('req grid update', room );
        $(board).fadeIn(fadeTime);
        updateButtons();
    });
}



function addOnclick_LEAVE( roomName ) {
    $(roomName).html('LEAVE');
    $(roomName).off('click');
    $(roomName).on('click', () => {
        room = 'lobby';
        socket.emit('join room', room);
        updateButtons();
        $(board).fadeOut(fadeTime);
    });
}



function updateNames( arrayOfObject ) {
    let num = $('div[id^="rm-"]').length;
    for ( i=0 ; i<num ; i++ ) {
        $('div[id^="rm-"]').eq(i).html('');
    }
    arrayOfObject.forEach( obj => {
        let str = obj.name;
        if (name == obj.name) str = `<b class="me">${name}</b>`;
        $(`div[id="rm-${obj.room}"]`).append(`<div>${str}</div>`);
    });
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
    $(board).fadeIn(fadeTime);
});



$('#room-name').on('focusout', () => {    
    $('#room-plus').show();
    $('#room-name').hide();
    $('#room-name').val('');
    updateButtons();
});













// ___________________________________ EVENT HANDLERS (END)

// SOCKET EVENTS __________________________________________



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









socket.on('res grid update', arr => {
    updateGrid(arr);
});







// socket.on('update board', data => {
//     let num = $('#board >').length;    
//     for ( i=0 ; i<num ; i++ ) {
//         $('#board >').eq(i).css('background', data[i]);
//     }
// });


// ______________________________________ SOCKET EVENTS (END)

// __________________________________________EVERYTHING (END)