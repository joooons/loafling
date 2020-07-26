


const socket = io();



// LOCAL VARIABLES ________________________________________

var name = 'none';
var room = 'lobby';
var numOfRooms = 4;





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
            ev.target.style.background = "white";
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








// _________________________________ LOCAL FUNCTIONS (END)

// EVENT HANDLERS ________________________________________

window.onresize = () => { resizeBoard(); }



pickName.onchange = () => {
    name = pickName.value;
    modal.style.display = "none";
    socket.emit('new user', name);
}



$('#room-plus').on('click', () => {
    $('#room-plus').toggle();
    $('#room-name').toggle(500);
    $('#room-name').focus();
});

$('#room-name').on('change', () => {
    let str = $('#room-name').val();
    $('#room-name').val('');
    $('#room-plus').toggle();
    $('#room-name').toggle();
    socket.emit('create room', str);
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
    let elem = document.createElement('div');
    $(elem).append(`<b>${roomName}</b><br>`);
    
    let button = document.createElement('button');
    button.innerText = 'JOIN';
    button.classList.add('noselect');
    button.classList.add('join-leave');
    button.onclick = ev => {
        if (room == 'lobby') {
            room = roomName;
            $('#board').fadeOut(100, () => {
                socket.emit('join room', room);
                let num = $('.join-leave').length;
                for ( i=0 ; i<num ; i++ ) {
                    $('.join-leave').eq(i).hide();
                }
                $(ev.target).show();
                ev.target.innerText = "LEAVE";
                $('#board').fadeIn(100);
            });
        } else {
            console.log('whats happening?');
            room = 'lobby';
            let num = $('.join-leave').length;
            for ( i=0 ; i<num ; i++ ) {
                $('.join-leave').eq(i).show();
                $('.join-leave').eq(i).html('JOIN');
            }
            $('#board').fadeOut(1000);
            socket.emit('join room', room);
        }
    }

    $(elem).append(button);
    $(elem).append(`<div id='rm-${roomName}'></div>`);
    $(roomSpace).append(elem);
});









socket.on('update board', data => {
    let num = $('#board >').length;    
    for ( i=0 ; i<num ; i++ ) {
        $('#board >').eq(i).css('background', data[i]);
    }
});


// ______________________________________ SOCKET EVENTS (END)

// __________________________________________EVERYTHING (END)