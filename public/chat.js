


const socket = io();



// LOCAL VARIABLES ________________________________________

var name = 'none';
var room = 'lobby';
// var numOfRooms = 4;







// DOM ELEMENTS ___________________________________________

const modal = document.querySelector('#modal');
const pickName = document.querySelector('#pick-name');

const lobbySpace = document.querySelector('#lobbySpace');
const roomSpace = document.querySelector('#roomSpace');
const boardSpace = document.querySelector('#boardSpace');

const board = document.querySelector('#board');






// INITIAL CONDITIONS ________________________________________

resizeBoard();

$(board).fadeOut(0, () => { $(board).css('visibility', 'visible'); });

$('#room-name').hide(0, () => { $('#room-name').css('visibility', 'visible'); });

socket.on('board config', data => { makeSquares(data); });


// addRoomBox('a');
// addRoomBox('b');
// addRoomBox('c');
// addRoomBox('d');
// addRoomBox('e');








// LOCAL FUNCTIONS ____________________________________________


function resizeBoard() {
    let x = window.innerWidth - 340;
    let y = window.innerHeight - 40;
    let dim = Math.min(x, y);
    board.style.width = dim + 'px';
    board.style.height = dim + 'px';
}





function makeSquares(num) {

    let str = `repeat(${num}, auto)`;
    $(board).css('grid-template-columns', str);

    for ( i=1 ; i<=Math.pow(num, 2) ; i++ ) {
        let num = i;
        let elem = document.createElement('div');
        elem.setAttribute('class', 'square');
        elem.innerText = num;
        elem.onclick = ev => {
            console.log(num);
            let color = ev.target.style.backgroundColor;
            console.log(color);
            color = (color != "yellow") ? "yellow" : "white";
            ev.target.style.background = color;
        }
        $(board).append(elem);
    }
}







function ArrToMap( arr, keyStr, valStr ) {
    let newMap = new Map();
    arr.forEach( obj => {
        newMap.set(obj[keyStr], obj[valStr]);
    });
    return newMap;
}








allowCreateRooms();
function allowCreateRooms() {
    $('#room-plus').html('<b>+</b>');
    $('#room-plus').show();
    $('#room-plus').css('cursor', 'pointer');
    $('#room-name').hide(500);
    $('#room-plus').on('click', () => {
        $('#room-plus').hide();
        $('#room-name').show(500);
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
        console.log(str);
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







function addRoomBox( room ) {
    $('#roomSpace').append(`<div id="rb-${room}"></div>`);
    $(`#rb-${room}`).append(`<b>${room}</b><hr>`);
    $(`#rb-${room}`).append(`<button id="bt-${room}">JOIN</button>`);
    $(`#rb-${room}`).append(`<div id="rm-${room}"></div>`);
}

function delRoomBox( room ) {
    $(`#rb-${room}`).remove();
}




function addOnclick_JOIN( room ) {
    console.log('add onclick join joined');
    $(room).html('JOIN');
    $(room).off('click');
    $(room).on('click', () => {
        
        console.log('join!');


    });
}



function addOnclick_LEAVE( room ) {
    $(room).html('LEAVE');
    $(room).off('click');
    $(room).on('click', () => {
        
        console.log('leave!');
        
    });
}










// _________________________________ LOCAL FUNCTIONS (END)

// EVENT HANDLERS ________________________________________

window.onresize = () => { resizeBoard(); }



pickName.onchange = () => {
    name = pickName.value;
    modal.style.display = "none";
    socket.emit('new user', name);
}







$('#room-name').on('change', () => {
    let str = $('#room-name').val();
    
    $('#room-name').val('');
    $('#room-plus').show();
    $('#room-name').hide();

    // addRoomBox( str );

    allButtonsJoin();

    // socket.emit('create room', str);
    // socket.emit('join room', str);
});

$('#room-name').on('focusout', () => {
    
    $('#room-plus').show();
    $('#room-name').hide();
    $('#room-name').val('');
    allButtonsJoin();
});



// lobbySpace.onclick = () => {
//     room = 'lobby';
//     $('#board').fadeOut(1000);
//     socket.emit('join room', room);
// }









// ___________________________________ EVENT HANDLERS (END)

// SOCKET EVENTS __________________________________________

socket.on('update names', arr => {
    let num = $('div[id^="rm-"]').length;
    for ( i=0 ; i<num ; i++ ) {
        $('div[id^="rm-"]').eq(i).html('');
    }
    arr.forEach( obj => {
        let str = obj.name;
        if (name == obj.name) str = `<b>${name}</b>`;
        $(`div[id="rm-${obj.room}"]`).append(`<div>${str}</div>`);
    });
});





socket.on('create room', roomName => {
    
    room = roomName;
    socket.emit('join room', room);
    $('#board').fadeIn(100);
    
    addRoomBox(room);
    // denyCreateRooms();
    onlyThisButtonLeave(room);
    
});









socket.on('update board', data => {
    let num = $('#board >').length;    
    for ( i=0 ; i<num ; i++ ) {
        $('#board >').eq(i).css('background', data[i]);
    }
});


// ______________________________________ SOCKET EVENTS (END)

// __________________________________________EVERYTHING (END)