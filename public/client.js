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

const playerLimit = 10;
const fadeTime = 500;
const boardRatio = 1.3;

var noName;

var ban = {};
ban.now = 0;
ban.next = 0;

// var bannedRoom = '  ';
var closedRoomArr = [];
    // Array of rooms that are closed...


var config = {};
config.dim = 0;
config.strict = false;
config.playerLimit = 0;
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
                    let str1 = coloredName(name, colorObj[name]);
                    let str2 = coloredName(victim, colorObj[victim]);
                    say(`${str2} says "Tis but a scratch."`);
                    emit.shout(room, `${str1} took a petty jab at ${str2}.`);
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

            say('Hey, are you crazy? That&#39;s suicide!');
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
    stage.fight();    
    countArr = [];
    scoreObj[name] = 0;
    gridArr = [];
    playerArr = [];
    colorObj = {};
}

function findWinner() {
    let max = 0;
    let winners = [];
    let strArr = [];
    let str = '';

    // NOTE: scoreObj may have scores of players that already left.
    playerArr.forEach( player => {
        // let score = scoreObj[player];
        max = Math.max( max, scoreObj[player] );
    });

    playerArr.forEach( player => {
        if ( scoreObj[player] == max ) winners.push(player);
    });

    if ( winners.length == playerArr.length ) {
        // If everyone has the same score...
        emit.shout(room, 'The war is over. You have brought balance to the world.');    
    } else {
        // If not everyone has the same score...
        winners.forEach( (nombre,i) => { strArr[i] = `${nombre}, `; });
        strArr[winners.length-1] = `and ${winners[winners.length-1]}`;
        if (winners.length < 3 ) strArr[0] = `${winners[0]} `;
        strArr.forEach( nombre => { str += nombre; });
        emit.shout(room, `${str} won!`);
    }
    
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
        return say('Uh, you can&#39;t do that. Don&#39;t be an ill eagle...'); 
    }

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

        say('You played a move.');
        let str = coloredName(name, colorObj[name] );
        emit.shout(room, `${str} played a move.`);

        calculateAttack(index);
        changeScore();
    } 
    
    emit.updateServerGrid(gridArr, ban.next );
    

}   // END of putStone()

function countStone(index) {
    // Counting the stones for the final score.

    let stoneOwner = gridArr[index];
    if ( stoneOwner != name ) return;

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
    
    if (playerArr.length > 2) return;
        // The ban applies only if there are exactly two players.

    let count = 0;
    let wall = arrNESW(atkPos);
    wall.forEach( val => {
        if (gridArr[val-1] == playerArr[0]) count++;
    });
    if (count == wall.length) {
        // All ban conditions are met.
        ban.next = banPos;
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
    
    board.style.width = dim + 'px';
    board.style.height = dim + 'px';
    message.style.height = '50px';
    message.style.width = ( board_x - 40 ) + 'px';
    
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
    room = room.slice(0,12);

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

function allButtonsJoin( closed_room ) {
    // All buttons should join, EXCEPT the rooms specified in the argument.
    let arr = closedRoomArr;
    if ( closed_room ) { arr = [closed_room]; }

    console.clear();
    console.log('----inside allButtonsJoin(); ---');
    console.log('closedArr is', arr);

    let num = $(`button[id^="bt-"]`).length;
    for ( i=0 ; i<num ; i++ ) {
        $(`button[id^="bt-"]`).eq(i).show();
        let str = $(`button[id^="bt-"]`).eq(i).attr('id').slice(3);
        console.log('str is', str);
        console.log( arr.includes(str) );

        if ( arr.includes(str) ) {
            $(`button[id^="bt-"]`).eq(i).off('click');
            $(`button[id^="bt-"]`).eq(i).css('color', 'gray');
            $(`button[id^="bt-"]`).eq(i).html('CLOSED');
        } else { addOnclick_JOIN(`#bt-${str}`); }

        $(`div[id^="rb-"]`).show();
    }
}

function onlyThisButtonLeave( roomName ) {

    let num = $(`button[id^="bt-"]`).length;
    for ( i=0 ; i<num ; i++ ) { $(`button[id^="bt-"]`).eq(i).hide(); }
    for ( i=0 ; i<num ; i++ ) { $(`div[id^="rb-"]`).eq(i).hide(); }
    addOnclick_LEAVE(`#bt-${roomName}`);
    $(`#bt-${roomName}`).show();
    $(`div[id="rb-${roomName}"]`).show();
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
    $('#create-room').after(`<div id="rb-${room}"></div>`);
    $(`#rb-${room}`).append(`<b>${room}</b><br>`);
    $(`#rb-${room}`).append(`<button id="bt-${room}">JOIN</button>`);
    $(`#rb-${room}`).append(`<div id="rm-${room}"></div>`);
    
    if ( closedRoomArr.includes(room) ) {
        closedRoomArr = _.without(closedRoomArr, room);
    }

}

function delRoomBox( room ) {
    $(`#rb-${room}`).remove();
    if ( closedRoomArr.includes(room) ) {
        closedRoomArr = _.without(closedRoomArr, room);
    }
}




function coloredName( player, color ) {
    return `<span style="color: ${color};">${player}</span>`;
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

            let str = coloredName(name,colorObj[name]);
            emit.shout(oldRoom, `Uh, ${str} left. Buh bye~`); 
        } 
        

        emit.joinRoom(room);

        playerArr = [];
        scoreObj = {};

        updateButtons();

        $('#message').html('');
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

        emit.requestToJoinRoom(room);

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
                // ...nothing to see here.
            break;
            default:
                // ...nothing to see here. move along.
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
        countArr = new Array( Math.pow( config.dim, 2) ).fill(noName);
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

function showRoomNameOnTop() {
    let str = room.toUpperCase();
    $('#boardHead').html(`You are in the ${str} room!`);
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
    $('#message').append(`<div>${str}</div>`);
    $('#message').animate( { scrollTop: $('#message').get(0).scrollHeight}, 700);
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

    

    if (passCount < playerArr.length ) {
        let str = coloredName(name, colorObj[name]);
        emit.shout(room, `${str} passed!`); 
    }

    shiftPlayerList();
});

$('#config-form').on('submit', ev => {
    ev.preventDefault();

    config.playerLimit = $('#config-num').val();
    config.dim = $('#config-dim').val();
    config.strict = !document.querySelector('#config-strict').checked;
    
    hideConfig();

    resetConfig();
    say('You&#39;re the first player to join. Please wait for the second player. The game ends when all players PASS in order. ');

    emit.requestToCreateRoom(room);

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
    requestToCreateRoom : (room) => { socket.emit('request to create room', room); },
    createRoom : (room, config) => { socket.emit('create room', room, config); },
    requestToJoinRoom : (room) => { socket.emit('request to join room', room); },
    joinRoom : (room) => { socket.emit('join room', room); },
    updatePlayerList : (room, playerArr) => {socket.emit('update player list', room, playerArr ); },
    updateClientGrid : (room) => { socket.emit('update grid on client', room ); },
    updateScore : (room, scoreObj) => { socket.emit('update score', room, scoreObj); },
    updateServerGrid : (gridArr, banNext) => { socket.emit('update grid on server', gridArr, banNext); },
    announceClosure : (room, bool) => { socket.emit('announce closure', room, bool); },
    pass : (room, passCount) => { socket.emit('update pass', room, passCount); },
    shout : (room,str) => { socket.emit('shout', room, str); }
    
}











// _______________________________ SOCKET EMIT EVENTS (END)

//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM  MMMMMM          MMMM    MM    MM  
//  MM    MM  MM    MM  MM    MM  MM  MM    MM          MM          MM    MM  MMMM  MM  
//    MM      MM    MM  MM        MMMM      MMMMMMMM    MM          MM    MM  MM  MMMM  
//      MM    MM    MM  MM        MM  MM    MM          MM          MM    MM  MM    MM  
//  MM    MM  MM    MM  MM    MM  MM    MM  MM          MM          MM    MM  MM    MM  
//    MMMM      MMMM      MMMM    MM    MM  MMMMMMMM    MM            MMMM    MM    MM  

// SOCKET ON EVENTS _______________________________________

socket.on('synchronize variables', blankName => {
    noName = blankName;
});


socket.on('change name', newName => {
    name = newName;
});


socket.on('board config', configData => { 
    config = configData;
    setUpGrid( config.dim ); 
});


socket.on('add roombox', (roomName) => {
    // if ( !bool ) closedRoomArr.push(roomName);
    addRoomBox( roomName );
    console.log('inside add roombox');
    console.log('closedRoomArr is', closedRoomArr);
    updateButtons();
});


socket.on('del roombox', roomName => {
    delRoomBox( roomName );
});


socket.on('entry granted', (entry_granted, config_data) => {
    if ( !entry_granted ) { return alert('The room is full.'); }

    config = config_data;
    resetConfig();

    $('#pass').fadeIn();

    let playerNum = $(`#rm-${room} >`).length;
    if (playerNum == 1) {
        say('You&#39;re the second player to join. Wait for your turn. The game ends when all players PASS in order.');
        let str = coloredName(name,colorObj[name]);
        emit.shout(room, `${str} joined the game. Now that there are at least 2 players, go ahead and make your first move!`);
    }

    if (playerNum > 1 ) {
        say(`You are player numero ${playerNum+1}. Wait for your turn. The game ends when all players PASS in order.`);
        let str = coloredName(name,colorObj[name]);
        emit.shout(room, `${str} is in the house!`);
    }
    
    emit.pass(room, passCount);
    emit.joinRoom(room);
    emit.updateScore(room, scoreObj);
    emit.updateClientGrid(room);

    $('#boardFrame').fadeIn(fadeTime);

    updateButtons();
    
    // setUpGrid(config.dim);
    
});



socket.on('update names', arr => {
    updateNames( arr );
});



socket.on('update player list', updatedPlayerList => {
    playerArr = updatedPlayerList;
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

            emit.announceClosure(room, false);

            passCount = 0;
            emit.pass(room, passCount);
            say('All players passed. Now, remove your stones that are as good as dead. Be honest now! Click PASS when you are done. ');
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


socket.on('room creation granted', roomName => {
    room = roomName;
    emit.createRoom(roomName, config);
    emit.updateClientGrid(roomName);
    emit.updateScore(roomName, scoreObj);
    $('#boardFrame').fadeIn(fadeTime);
});


socket.on('announce room open', roomName => {


    closedRoomArr = _.without(closedRoomArr, roomName);
    updateButtons();
});


socket.on('announce room closed', roomName => {
    closedRoomArr.push(roomName);
    updateButtons();
});



// ___________________________________ SOCKET ON EVENTS (END)

// __________________________________________EVERYTHING (END)