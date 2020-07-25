
const socket = io();




var name = 'none';




const modal = document.querySelector('#modal');
const pickName = document.querySelector('#pick-name');
const lobbyUsers = document.querySelector('#lobbyUsers');



pickName.onchange = () => {
    name = pickName.value;
    modal.style.display = "none";
    socket.emit('new-user', name);
}



socket.on('new-user', data => {
    let str = '';
    data.forEach( val => {
        str += `<div>${val.name}</div>`;
    });
    lobbyUsers.innerHTML = str;
});





