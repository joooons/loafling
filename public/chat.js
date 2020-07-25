
const socket = io();



// LOCAL VARIABLES ________________________________________

var name = 'none';
var room = 'room0';
var numOfRooms = 4;





// DOM ELEMENTS ___________________________________________

const modal = document.querySelector('#modal');
const pickName = document.querySelector('#pick-name');

const lobbySpace = document.querySelector('#lobbySpace');
const roomSpace = document.querySelector('#roomSpace');
const boardSpace = document.querySelector('#boardSpace');






// LOCAL FUNCTIONS ____________________________________________

makeRooms( numOfRooms );
function makeRooms(num) {
    for ( i=1 ; i<=num ; i++ ) {
        let elem = document.createElement('div');
        $(elem).append(`<b>Room ${i}</b>`);
        let button = document.createElement('button');
            let roomID = `room${i}`;
            button.innerText = 'JOIN';
            button.onclick = () => {
                room = roomID;
                socket.emit('join room', roomID);
            }
        $(elem).append(button);
        $(elem).append(`<div id='room${i}'></div>`);
        $(roomSpace).append(elem);
    }
}






// EVENT HANDLERS ________________________________________

pickName.onchange = () => {
    name = pickName.value;
    modal.style.display = "none";
    socket.emit('new user', name);
}



lobbySpace.onclick = () => {
    room = 'room0';
    socket.emit('join room', room);
}











// SOCKET EVENTS __________________________________________

socket.on('update names', data => {
    for ( i=0 ; i<=numOfRooms ; i++ ) {
        $(`div[id="room${i}"]`).html('');
    }

    data.forEach( obj => {
        let str = obj.name;
        if (name == obj.name) str = `<b>${name}</b>`;
        $(`div[id="${obj.room}"]`).append(`<div>${str}</div>`);
    });
});


