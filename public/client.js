// const { first } = require("underscore");

const socket = io();





//  MM        MMMM      MMMM      MMMM    MM            MM      MM    MMMM    MMMMMM    
//  MM      MM    MM  MM    MM  MM    MM  MM            MM      MM  MM    MM  MM    MM  
//  MM      MM    MM  MM        MMMMMMMM  MM            MM      MM  MMMMMMMM  MMMMMM    
//  MM      MM    MM  MM        MM    MM  MM            MM      MM  MM    MM  MM    MM  
//  MM      MM    MM  MM    MM  MM    MM  MM              MM  MM    MM    MM  MM    MM  
//  MMMMMM    MMMM      MMMM    MM    MM  MMMMMM            MM      MM    MM  MM    MM  

// LOCAL VARIABLES ________________________________________

var name = 'none';
var room = 'lobby';
var passCount = 0;
    // If the number of passing players is equal to number of players...
    // ...the game moves to the next stage.

const playerLimit = 4;
const fadeTime = 500;
const boardRatio = 1.3;

var noName;
var boardDim;

var ban = {};
ban.now = 0;
ban.next = 0;

var bannedRoom = '  ';

const config = {};
config.dim = 6;
config.strict = false;
config.playerLimit = 2;
    // IF config is set to "strict"...
    // You cannot play alone.
    // You cannot play out of turn.
    // You cannot remove your own stone.


var stage =  {};
stage['stat'] = 'fight';
stage['fight'] = () => { stage.stat = 'fight'; }
stage['clean'] = () => { stage.stat = 'clean'; }
stage['count'] = () => { stage.stat = 'count'; }
    


var gridArr = [];
    // The array of names assigned to the board grid.
    // Only for the room that the player is currently connected to.

var countArr = [];
    // Like gridArr, except this is array of empty spaces owned by each player.

var playerArr = [];
    // The local array of names of players in the current room, in order of entry.
    // Corresponds to Room_PlayerArr map in index.js.
    // But this one is specific to just the current room.
    // Also, the order changes to .... actually...

var scoreObj = {};
    // The local object that contains the score of all players in the room.
    // Associated with Room_Score object in index.js

var colorObj = {};
    // Object with { name:color, name:color .... }

















//  MMMMMM      MMMM    MM      MM        MMMMMMMM  MM      MMMMMMMM  MM      MM  
//  MM    MM  MM    MM  MMMM  MMMM        MM        MM      MM        MMMM  MMMM  
//  MM    MM  MM    MM  MM  MM  MM        MMMMMMMM  MM      MMMMMMMM  MM  MM  MM  
//  MM    MM  MM    MM  MM      MM        MM        MM      MM        MM      MM  
//  MM    MM  MM    MM  MM      MM        MM        MM      MM        MM      MM  
//  MMMMMM      MMMM    MM      MM        MMMMMMMM  MMMMMM  MMMMMMMM  MM      MM  

// DOM ELEMENTS ___________________________________________

const modal = document.querySelector('#modal');
const pickName = document.querySelector('#pick-name');

const lobbySpace = document.querySelector('#lobbySpace');
const roomSpace = document.querySelector('#roomSpace');
const boardSpace = document.querySelector('#boardSpace');
const boardFrame = document.querySelector('#boardFrame');
const message = document.querySelector('#message');

const board = document.querySelector('#board');












//  MMMMMM  MM    MM  MMMMMM  MMMMMM          MMMM      MMMM    MM    MM  MMMMMM    MMMMMM    MMMM    MM    MM  
//    MM    MMMM  MM    MM      MM          MM    MM  MM    MM  MMMM  MM  MM    MM    MM    MM    MM  MM    MM  
//    MM    MM  MMMM    MM      MM          MM        MM    MM  MM  MMMM  MM    MM    MM      MM      MMMMMMMM  
//    MM    MM    MM    MM      MM          MM        MM    MM  MM    MM  MM    MM    MM        MM    MM    MM  
//    MM    MM    MM    MM      MM          MM    MM  MM    MM  MM    MM  MM    MM    MM    MM    MM  MM    MM  
//  MMMMMM  MM    MM  MMMMMM    MM            MMMM      MMMM    MM    MM  MMMMMM    MMMMMM    MMMM    MM    MM  

// INITIAL CONDITIONS ________________________________________

resizeBoard();

allowCreateRooms();

$('#boardFrame').fadeOut(0, () => { $('#boardFrame').css('visibility', 'visible'); });

$('#room-name').hide(0, () => { $('#room-name').css('visibility', 'visible'); });

socket.on('board config', dim => { setUpGrid( dim ); });

$('#config').hide();











//  MMMMMMMM  MM    MM  MM    MM    MMMM    MMMMMM  MMMMMM    MMMM    MM    MM    MMMM    
//  MM        MM    MM  MMMM  MM  MM    MM    MM      MM    MM    MM  MMMM  MM  MM    MM  
//  MMMMMMMM  MM    MM  MM  MMMM  MM          MM      MM    MM    MM  MM  MMMM    MM      
//  MM        MM    MM  MM    MM  MM          MM      MM    MM    MM  MM    MM      MM    
//  MM        MM    MM  MM    MM  MM    MM    MM      MM    MM    MM  MM    MM  MM    MM  
//  MM          MMMM    MM    MM    MMMM      MM    MMMMMM    MMMM    MM    MM    MMMM    

// LOCAL FUNCTIONS ____________________________________________












//        MM      MM    MMMM    MMMMMM  MM    MM  
//        MMMM  MMMM  MM    MM    MM    MM    MM  
//        MM  MM  MM  MMMMMMMM    MM    MMMMMMMM  
//        MM      MM  MM    MM    MM    MM    MM  
//        MM      MM  MM    MM    MM    MM    MM  
//        MM      MM  MM    MM    MM    MM    MM  

function calculateAttack(indexValue) {
    if (playerArr.length < 2) return;
        // Attack only if there are at least 2 players. Duh.

    let pos = indexValue + 1;
    let wallIndex = [];
    let attackSucceeded = false;
    // ban.next = 0;
    
    let roster = [...playerArr];
        // Temporary list of players, starting with first victim.
        // Includes player who attacked.
        // At this point, roster[0] is the NEXT player.

    roster.forEach( victim => {
        if ( !Game_Rox[victim] ) return;
            // If this player has no data cuz he just started...
        if ( victim == name ) return;
            // Can't attack yourself

        let walls = Game_Rox[victim].walls;
            // If my stones perfectly match your walls, I surrounded you.
        let killList = [];

        walls.forEach( (wall,i) => { if (wall.includes(pos)) wallIndex.push(i); });
            // Find the walls that at least TOUCH the stone I just put down.
        
        wallIndex.forEach( i => {
            let count = 0;
            let team = Game_Rox[victim].teams[i];
            let wall = walls[i];
            wall.forEach( posValue => {
                if (_.without(roster, victim).includes( gridArr[posValue-1])) count++;
            });
            if ( count == walls[i].length ) {
                // A successful attack.

                let points = team.length;
                scoreObj[victim] -= points;

                if ( points == 1 ) {
                    say(`${victim} says "Tis but a scratch."`);
                    emit.shout(room, 'So it begins...');
                } else if ( points > 4 ) {
                    say(`Savage...`);
                    emit.shout(room, 'It&#39;s getting real...');
                }

                if ( team.length == 1) { checkForBan(team[0], pos); }
                // Apply a ban if the conditions for potential repetition are met.

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
        // Check for suicide move, and prohibit it.
        
        let teams = Game_Rox[name].teams;
        let index = 9999;           // arbitrary number 

        teams.forEach( (team,i) => { if (team.includes(pos)) index = i; });
        
        let count = 0;
        let wall = Game_Rox[name].walls[index];

        wall.forEach( val => {
            if (_.without(roster, name).includes( gridArr[val-1])) count++;
        });

        if (count == wall.length) {
            gridArr[pos-1] = noName;

            say('Hey, are you crazy? it&#39;s dangerous there!');
            GridArrToGame_Rox();
            shiftPlayerList(name);
        }
        
    }       // END of if ( !attackSucceeded ) {...}

}   // END of calculateAttack() {...}

function changeScore() {
    emit.updateScore(room, scoreObj);
}   // END of changeScore()

function updateLocalGrid( grid ) {
    gridArr = grid;
    GridArrToGame_Rox();

    let num1 = gridArr.length;
    let num2 = Game_Rox[noName].total.length;
    let num3 = playerArr.length;
    if ( num2 == num1 - (2 * num3) ) say('Oh, by the way... The game ends when all players PASS consecutively. ');
        // At an arbitrary point in time in the game, the players are notified of the rules.

}   // END of updateLocalGrid()

function ArrToMap( arr, keyStr, valStr ) {
    let newMap = new Map();
    arr.forEach( obj => { newMap.set(obj[keyStr], obj[valStr]); });
    return newMap;
}

function shiftPlayerList(name) {
    if ( !playerArr.includes(name) && name ) return;
    if (playerArr.length < 2) return;
    let target = ( !name ) ? playerArr[1] : name;
    do { playerArr.push( playerArr.shift() ); 
    } while ( playerArr[0] != target );
    emit.updatePlayerList(room, playerArr);
}

function resetConfig() {
    revertStoneCSS();
    passCount = 0;
    // config.dim = 6;
    config.strict = true;
    // config.playerLimit = 2;
    stage.fight();    
    countArr = [];
    scoreObj[name] = 0;
    gridArr = [];
    playerArr = [];
    colorObj = {};
    say('');
}

function findWinner() {
    let max = 0;
    let winners = [];
    let strArr = [];
    let str = '';
    Object.values(scoreObj).forEach( num => { max = Math.max( max, num ); });
    Object.keys(scoreObj).forEach( nombre => { if ( scoreObj[nombre] == max ) winners.push(nombre); });
    winners.forEach( (nombre,i) => { if (nombre == name) winners[i] = 'you'; });
    winners.forEach( (nombre,i) => { strArr[i] = `${nombre}, `; });
    strArr[winners.length-1] = `and ${winners[winners.length-1]}`;
    if (winners.length < 3 ) strArr[0] = `${winners[0]} `;
    strArr.forEach( nombre => { str += nombre; });
    say(`${str} won!`);
    emit.shout(room, `${str} won!`);
    $('#pass').fadeOut();
}

function putStone(index) {
    // FOUR things could happen.
    // (1) Be prevented from placing a stone at all.
    // (2) Remove a stone that belongs to me.
    // (3) Put a stone down.
    // (4) put a stone down, and then pick it up again.

    ban.next = 0;
    emit.pass(room, passCount=0);
    // Hmmm... where does this belong???

    let stone = gridArr[index];

    // This is SCENARIO #1. Unable to put a stone down at all.
    if (config.strict) {
        // IF config is set to strict...
        // You cannot play alone.
        // You cannot play out of turn.
        // You cannot remove your own stone.
        if (playerArr.length == 1) return;
        if (playerArr[0] != name ) { return say('It&#39;s nacho turn.'); }
        if (stone == name) return;
    }

    // This is also SCENARIO #1. Unable to put a stone down at all.
    if ( ban.now == index + 1 ) {
        console.log('banned!');
        say('Uh, it&#39;s kind of an ill eagle to do that...');
        return; 
    }
        // Prohibit placing stone on banned spot.

    // This is SCENARIO #2 and SCENARIO #3, and maybe SCENARIO #4.
    // Either remove a stone, or put a stone down...
    // ... and possibly take the stone back after putting it down.
    if (stone == name) { gridArr[index] = noName; }
    else if (stone == noName) { gridArr[index] = name; }
    else { return; }


    updateLocalGrid( gridArr );
    GridArrToGame_Rox();
    shiftPlayerList(name);
    shiftPlayerList();
        // In the case that I've put a stone down...
        // ...even though I may have to pick it up again...
        // ...I still have to update the Game_Rox in order to do calculations...
        // ...about whether I have to take that stone back again.
        // Also, reset order of players, and go to the next player.

    if ( gridArr[index] == name ) {
        // If I put a stone, as opposed to remove, then do this.
        say('');
        emit.shout(room, '');
        calculateAttack(index);
        changeScore();
    } 
    // else { ban.next = 0; }
    
    // console.log('right before updateServerGrid, ban.next: ', ban.next );
    emit.updateServerGrid(gridArr, ban.next );

}   // END of putStone()

function countStone(index) {
    // Counting the stones for the final score.

    let stoneOwner = gridArr[index];
    if ( stoneOwner != name ) return;
    // if ( stone == noName ) return;
    console.log( stoneOwner );

    scoreObj[stoneOwner]--;
    gridArr[index] = noName;

    updateLocalGrid( gridArr );
    GridArrToGame_Rox();
    changeScore();

    emit.updateServerGrid(gridArr, ban.next );

}   // END of countStone()

function checkForBan(banPos, atkPos) {
    // This function is triggered when exactly ONE enemy stone was removed.
    // Two more tests: Is this a 2 player game?
    // Next: is the attack stone surrounded in 3 directions?
    // If so, the place of the removed stone is a banned spot.
    
    // console.log(banPos, atkPos);

    if (playerArr.length > 2) return;
        // The ban applies only if there are exactly two players.

    let count = 0;
    let wall = arrNESW(atkPos);
    wall.forEach( val => {
        // console.log(val, gridArr[val-1], playerArr[0]);
        if (gridArr[val-1] == playerArr[0]) count++;
    });
    if (count == wall.length) {
        // All ban conditions are met.
        console.log(banPos, ' is banned!');
        ban.next = banPos;
        // bannedPos = banPos;
    } 
}














//        MMMMMM      MMMM    MM      MM        MM      MM    MMMM    MM      MM  MMMMMM  
//        MM    MM  MM    MM  MMMM  MMMM        MMMM  MMMM  MM    MM  MMMM  MMMM    MM    
//        MM    MM  MM    MM  MM  MM  MM        MM  MM  MM  MM        MM  MM  MM    MM    
//        MM    MM  MM    MM  MM      MM        MM      MM  MM  MMMM  MM      MM    MM    
//        MM    MM  MM    MM  MM      MM        MM      MM  MM    MM  MM      MM    MM    
//        MMMMMM      MMMM    MM      MM        MM      MM    MMMM    MM      MM    MM    


function resizeBoard() {
    let x = window.innerWidth - 220;
    let y = window.innerHeight - 60;
    let board_x, board_y;
    let windowRatio = x / y;
    let xLimit = 200;
    let yLimit = 200;

    if ( windowRatio < boardRatio ) {
        // When window is too skinny
        board_x = Math.max(xLimit,x);
        board_y = Math.max(xLimit,x) / boardRatio;
    } else {
        // When window is too wide
        board_x = Math.max(yLimit,y) * boardRatio;
        board_y = Math.max(yLimit,y);
    }
    
    let dim = board_y - 70;
    
    // boardFrame.style.width = board_x + 'px';
    // boardFrame.style.height = board_y + 'px';
    board.style.width = dim + 'px';
    board.style.height = dim + 'px';
    message.style.height = '50px';
    message.style.width = ( board_x - 40 ) + 'px';
    // message.style.left = 0;
    // message.style.right = 0;
    
}

function setUpGrid( num ) {
    addSVGtoBoard(board, num);
}

function createRoom() {
    let reg = /[\s\"\']/;
    if ( reg.test( $('#room-name').val() ) ) {
        $('#room-name').attr('placeholder', 'no spaces!');
        $('#room-name').val('');
        return;    
    }
    room = $('#room-name').val();
    room = room.slice(0,8);
    // if (room == bannedRoom) bannedRoom = '1vb087230n87edsaf';


    $('#room-name').val('');
    $('#room-name').attr('placeholder', 'room name');
    $('#room-plus').show();
    $('#room-name').hide();
    $('#pass').fadeIn();

    showConfig();
}

function allowCreateRooms() {
    $('#room-plus').html('<b>add room</b>');
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
    $('#room-plus').html('<b>&#10006;</b>');
    $('#room-plus').css('cursor', 'default');
    $('#room-plus').off('click');
}

function allButtonsJoin(elem) {
    // All buttons should join, EXCEPT the one specified in the argument.

    // console.log('inside allButtonsJoin() ');
    // console.log(elem);
    let num = $(`button[id^="bt-"]`).length;
    for ( i=0 ; i<num ; i++ ) {
        $(`button[id^="bt-"]`).eq(i).show();
        let str = $(`button[id^="bt-"]`).eq(i).attr('id');
        // console.log(str, elem);
        if ( `#${str}` != elem ) addOnclick_JOIN(`#${str}`);
        $(`div[id^="rb-"]`).show();
    }
}

function onlyThisButtonLeave( room ) {
    let num = $(`button[id^="bt-"]`).length;
    for ( i=0 ; i<num ; i++ ) { $(`button[id^="bt-"]`).eq(i).hide(); }
    for ( i=0 ; i<num ; i++ ) { $(`div[id^="rb-"]`).eq(i).hide(); }
    addOnclick_LEAVE(`#bt-${room}`);
    $(`#bt-${room}`).show();
    $(`div[id^="rb-${room}"]`).show();
}

function updateButtons() {
    if ( room == 'lobby' ) {
        allowCreateRooms();
        allButtonsJoin(bannedRoom);
    } else {
        denyCreateRooms();
        onlyThisButtonLeave(room);
    }
}

function addRoomBox( room ) {
    $('#create-room').after(`<div id="rb-${room}"></div>`);
    $(`#rb-${room}`).append(`<b>${room}</b><br>`);
    $(`#rb-${room}`).append(`<button id="bt-${room}">JOIN</button>`);
    $(`#rb-${room}`).append(`<div id="rm-${room}"></div>`);
}

function delRoomBox( room ) {
    $(`#rb-${room}`).remove();
    if ( bannedRoom == `#bt-${room}` ) bannedRoom = ' ';
}








//          MMMM    MMMMMM    MMMMMM            MMMM    MM    MM    MMMM    MM      MMMMMM    MMMM    MM    MM  
//        MM    MM  MM    MM  MM    MM        MM    MM  MMMM  MM  MM    MM  MM        MM    MM    MM  MM  MM    
//        MMMMMMMM  MM    MM  MM    MM        MM    MM  MM  MMMM  MM        MM        MM    MM        MMMM      
//        MM    MM  MM    MM  MM    MM        MM    MM  MM    MM  MM        MM        MM    MM        MM  MM    
//        MM    MM  MM    MM  MM    MM        MM    MM  MM    MM  MM    MM  MM        MM    MM    MM  MM    MM  
//        MM    MM  MMMMMM    MMMMMM            MMMM    MM    MM    MMMM    MMMMMM  MMMMMM    MMMM    MM    MM  


function addOnclick_LEAVE( roomName ) {
    $(roomName).html('LEAVE');
    $(roomName).off('click');
    $(roomName).on('click', () => {
        oldRoom = room;
        room = 'lobby';
        
        scoreObj[name] = -9999;        // -9999 designated as sign of leaving.
        emit.updateScore(room, scoreObj);

        if ( stage.stat != 'count' ) { 
            emit.shout(oldRoom, `Uh, ${name} left. Buh bye~`); 
        } 
        
        if ( stage.stat != 'fight' ) {
            // If you leave during "clean" or "count stage"...
            // ...you cannot reenter the room. Sorry.
            let elem = `#bt-${oldRoom}`;
            $(elem).off("click");
            $(elem).css('color', 'gray');
            $(elem).html('CLOSED');
            bannedRoom = elem;
        }

        emit.joinRoom(room);

        playerArr = [];
        scoreObj = {};
        updateButtons();
        $('#boardFrame').fadeOut(fadeTime);
    });
}

function addOnclick_JOIN( roomName ) {
    // the "roomName" argument is actually "bt-${room}"

    $(roomName).html('JOIN');
    $(roomName).off('click');
    $(roomName).css('color', 'black');
    $(roomName).on('click', () => {
        room = roomName.slice(4);
        let playerNum = $(`#rm-${room} >`).length;


        if ( playerNum < playerLimit ) {

            resetConfig();

            $('#pass').fadeIn();

            if (playerNum == 1) {
                say('You&#39;re the second player. Wait for your turn.');
                emit.shout(room, 'Second player joined. With at least 2 players, you can start playing. You go first.');
            }

            if (playerNum > 1 ) {
                say(`You are player numero ${playerNum+1}. Wait for your turn.`);
                emit.shout(room, `${name} joined. Yay.`);
            }
            
            emit.pass(room, passCount);
            emit.joinRoom(room);
            emit.updateScore(room, scoreObj);
            emit.updateClientGrid(room);

            $('#boardFrame').fadeIn(fadeTime);
            updateButtons();



        } else {
            alert('room full');
        }
    });
}

function addOnclick_putStone( elem, index ) {
    
    elem.onclick = () => { 
        switch(stage.stat) {
            case 'fight':
                putStone(index); 
            break;
            case 'clean':
                countStone(index);
            break;
            case 'count':
                // console.log('nothing to do here');
            break;
            default:
                // console.log('this option does not exist');
        }        
    }

}   // END of addOnclick_putStone()

















//          MMMM    MM    MM    MMMM    MM      MM  
//        MM    MM  MM    MM  MM    MM  MM      MM  
//          MM      MMMMMMMM  MM    MM  MM      MM  
//            MM    MM    MM  MM    MM  MM  MM  MM  
//        MM    MM  MM    MM  MM    MM  MM  MM  MM  
//          MMMM    MM    MM    MMMM      MM  MM    

function showScoreboard(obj) {
    scoreObj = obj;
    let tempArr = [...playerArr];
    do { tempArr.push( tempArr.shift() ); 
    } while ( tempArr[0] != name );
    
    let str = '';

    $('#players').html('');

    tempArr.forEach( player => {
        let str = '';
        if (player == playerArr[0]) str = '&#8594;';
        $('#players').append(`<div>${str}</div>`);
        $('#players').append(`<div style="color: ${colorObj[player]}"><sup>&#11044;</sup></div>`);
        str = `${player}`;
        if ( player == name ) str = `<b>${player}</b>`;
        $('#players').append(`<div>${str}</div>`);
        $('#players').append(`<div>&nbsp;&nbsp;&nbsp;${scoreObj[player]}</div>`);
    });
    
    // $('#players').html(str);
}

function showCountArr() {
    
    identifyHouse();

    countArr.forEach( (_name, i) => {
        if ( _name == noName ) return;
        $('.square').eq(i).css('fill', "#fff0" );
        // $('.square').eq(i).css('fill', colorObj[_name] );
        // $('.square').eq(i).css('opacity', 0.5 );
        $('.square').eq(i).css('stroke', colorObj[_name]);
        $('.square').eq(i).css('stroke-width', '5');
        $('.square').eq(i).css('stroke-linecap', 'round');
        $('.square').eq(i).css('stroke-dasharray', '10 13');
        $('.square').eq(i).css('r', '40');
    });

    function identifyHouse() {
        let teams = Game_Rox[noName].teams;
        let walls = Game_Rox[noName].walls;
        countArr = new Array( Math.pow(boardDim, 2) ).fill(noName);
        walls.forEach( (wall,i) => {
            let enemies = [];
            wall.forEach( pos => {
                let index = pos - 1;
                let enemy = gridArr[index];
                if ( !enemies.includes(enemy) ) enemies.push(enemy);
            });
            if ( enemies.length == 1 ) {
                teams[i].forEach( pos => {
                    let index = pos - 1;
                    countArr[index] = enemies[0];
                    scoreObj[enemies[0]]++;
                });
            }
        });
        changeScore();
    }

    findWinner();

}

function visualizeGrid( colorObject, name_grid ) {
    name_grid.forEach( ( _name, i) => {
        let color = colorObject[_name];
        $('.square').eq(i).css('fill', color );
    });
    updateLocalGrid( name_grid );
}

function updateNames( arrayOfObject ) {
    let num = $('div[id^="rm-"]').length;
    for ( i=0 ; i<num ; i++ ) { $('div[id^="rm-"]').eq(i).html(''); }
    arrayOfObject.forEach( obj => {
        let [a, b, c ] = ['', obj.name, ''];
        if (name == obj.name) [a,c] = [ 'class="me"', ' (me)'];
        if ( !(name == obj.name) ) [a,c] = [ 'class="them"', ''];
        $(`div[id="rm-${obj.room}"]`).append(`<div ${a}>${b} ${c}</div>`);
    });
}

function revertStoneCSS() {
    
    countArr.forEach( (_name, i) => {
        if ( _name == noName ) return;
        $('.square').eq(i).css('fill', "#fff0" );
        // $('.square').eq(i).css('opacity', 1 );
        $('.square').eq(i).css('stroke-width', 0);
        $('.square').eq(i).css('r', 46);
    });
}

function say(str) {
    $('#message').html(str);
}


function showConfig() {
    $('#config').css('z-index', 1);
    $('#config').show();


}

function hideConfig() {

    $('#config').hide();
}





// _________________________________ LOCAL FUNCTIONS (END)

//  MMMMMMMM  MM      MM  MMMMMMMM  MM    MM  MMMMMM    MMMM    
//  MM        MM      MM  MM        MMMM  MM    MM    MM    MM  
//  MMMMMMMM  MM      MM  MMMMMMMM  MM  MMMM    MM      MM      
//  MM        MM      MM  MM        MM    MM    MM        MM    
//  MM          MM  MM    MM        MM    MM    MM    MM    MM  
//  MMMMMMMM      MM      MMMMMMMM  MM    MM    MM      MMMM    

// EVENT HANDLERS ________________________________________

window.onresize = () => { resizeBoard(); }

pickName.onchange = () => {
    name = pickName.value;
    pickName.value = '';
    modal.style.display = "none";
    name = name.slice(0,8);
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

$('#pass').on('click', () => {


    if ( playerArr.length < 2 ) return;
    if ( stage.stat == 'count') return;
    if ( playerArr[0] != name ) {
        say('You can&#39;t pass when it&#39;s nacho turn.');
        return;
    }
    passCount++;
    emit.pass(room, passCount);
    say('You passed!');
    emit.shout(room, `${name} passed!`);
    shiftPlayerList();
});

$('#config-btn').on('click', () => {
    let num = $('#config-num').val();
    let dim = $('#config-dim').val();
    let strict = $('#config-strict').val();
    console.log(num, dim, strict);
    hideConfig();

    resetConfig();
    say('You&#39;re the first one in this room. Wait for the second player. ');
    emit.createRoom(room);
    emit.updateClientGrid(room);
    emit.updateScore(room, scoreObj);
    $('#boardFrame').fadeIn(fadeTime);

});









// ___________________________________ EVENT HANDLERS (END)

//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM  MMMMMM        MMMMMMMM  MM      MM  MMMMMM  MMMMMM  
//  MM    MM  MM    MM  MM    MM  MM  MM    MM          MM          MM        MMMM  MMMM    MM      MM    
//    MM      MM    MM  MM        MMMM      MMMMMMMM    MM          MMMMMMMM  MM  MM  MM    MM      MM    
//      MM    MM    MM  MM        MM  MM    MM          MM          MM        MM      MM    MM      MM    
//  MM    MM  MM    MM  MM    MM  MM    MM  MM          MM          MM        MM      MM    MM      MM    
//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM    MM          MMMMMMMM  MM      MM  MMMMMM    MM    

// SOCKET EMIT EVENTS _____________________________________

var emit = {
    newUser : (name) => { socket.emit('new user', name); },
    createRoom : (room) => { socket.emit('create room', room); },
    joinRoom : (room) => { socket.emit('join room', room); },
    updatePlayerList : (room, playerArr) => {socket.emit('update player list', room, playerArr ); },
    updateClientGrid : (room) => { socket.emit('update grid on client', room ); },
    updateScore : (room, scoreObj) => { socket.emit('update score', room, scoreObj); },
    updateServerGrid : (gridArr, banNext) => { socket.emit('update grid on server', gridArr, banNext); },
    pass : (room, passCount) => { socket.emit('update pass', room, passCount )},
    shout : (room,str) => { socket.emit('shout', room, str)}
    
}











// _______________________________ SOCKET EMIT EVENTS (END)

//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM  MMMMMM          MMMM    MM    MM  
//  MM    MM  MM    MM  MM    MM  MM  MM    MM          MM          MM    MM  MMMM  MM  
//    MM      MM    MM  MM        MMMM      MMMMMMMM    MM          MM    MM  MM  MMMM  
//      MM    MM    MM  MM        MM  MM    MM          MM          MM    MM  MM    MM  
//  MM    MM  MM    MM  MM    MM  MM    MM  MM          MM          MM    MM  MM    MM  
//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM    MM            MMMM    MM    MM  

// SOCKET ON EVENTS _______________________________________

socket.on('synchronize variables', (blankName, dim) => {
    noName = blankName;
    boardDim = dim;
    // banned = bannedName;
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
    // let num1 = playerArr.length;
    // let num2 = updatedPlayerList.length;
    // if ( num1==1 && num2==2 ) { say(`Second player joined. With at least 2 players, you can start playing. ${playerArr[0]} goes first.`) }
    // if ( num2 > 2) { say(`${playerArr[playerArr.length-1]} joined.`)   }
    playerArr = updatedPlayerList;
    // let str = `<div>${updatedPlayerList[0]}'s turn!</div>`;
    // if (playerArr[0] == name ) say('It&#39;s your turn! Hurry up!');
    showScoreboard(scoreObj);
});


socket.on('update grid', (colorObject, name_grid, banNext) => {
    if (stage.stat == 'count') { return; }
    if ( banNext ) { ban.now = banNext;
    } else { ban.now = 0; }
    ban.next = 0;
    colorObj = colorObject;
    showScoreboard(scoreObj);
    visualizeGrid(colorObj, name_grid);
});


socket.on('update score', obj => {
    showScoreboard(obj);
});


socket.on('update pass', count => {
    passCount = count;
    if ( passCount == 0 ) return;
    if ( passCount == playerArr.length ) {
        if (stage.stat == 'fight') {
            stage.clean();
            passCount = 0;
            emit.pass(room, passCount);
            say('All players passed. Now, carefully remove obviously dead stones. Click PASS when you are done. ');
            emit.shout(room, 'All players passed. Remove your stones that are as good as dead. Click PASS when you are done. ');
        } else if (stage.stat == 'clean' ) {
            passCount = 0;
            emit.pass(room, passCount);
            showCountArr();
            stage.count();
        }
    } 

});


socket.on('shout', (str) => {
    say(str);
});



// ___________________________________ SOCKET ON EVENTS (END)

// __________________________________________EVERYTHING (END)