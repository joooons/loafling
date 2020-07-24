


const socket = io();

const name = document.querySelector('#name');
const text = document.querySelector('#text');
// const board = document.querySelector('#board');

var username = '';

name.onchange = () => {
    username = name.value;
    console.log(`your name is ${username}`);
}

text.onchange = () => {
    let str = $(text).val();
    let tote = `${username}: ${str}`;
    $(text).val('');
    socket.emit('message', tote);
};

socket.on('message', data => {
    $(board).append(`<li>${data}</li>`);
});