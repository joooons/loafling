
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

const playerLimit = 4;
const fadeTime = 500;
const boardRatio = 1.5;

var noName;
var boardDim;

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
    console.log('--- attack!!! ---');

    let pos = indexValue + 1;
    let wallIndex = [];
    let attackSucceeded = false;
    
    let roster = [...playerArr];
        // Temporary list of players, starting with first victim.
        // Includes player who attacked.

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
        let index = 9999;           // arbitrary number 

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

function ArrToMap( arr, keyStr, valStr ) {
    let newMap = new Map();
    arr.forEach( obj => {
        newMap.set(obj[keyStr], obj[valStr]);
    });
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
    
    config.dim = 6;
    config.strict = false;
    config.playerLimit = 2;
    
    stage.fight();    
    
    countArr = [];
    scoreObj[name] = 0;

    gridArr = [];
    playerArr = [];
    colorObj = {};

    

    $('#message').html('prepare to die');

}




//        MMMMMM      MMMM    MM      MM        MM      MM    MMMM    MM      MM  MMMMMM  
//        MM    MM  MM    MM  MMMM  MMMM        MMMM  MMMM  MM    MM  MMMM  MMMM    MM    
//        MM    MM  MM    MM  MM  MM  MM        MM  MM  MM  MM        MM  MM  MM    MM    
//        MM    MM  MM    MM  MM      MM        MM      MM  MM  MMMM  MM      MM    MM    
//        MM    MM  MM    MM  MM      MM        MM      MM  MM    MM  MM      MM    MM    
//        MMMMMM      MMMM    MM      MM        MM      MM    MMMM    MM      MM    MM    


function resizeBoard() {
    let x = window.innerWidth - 240;
    let y = window.innerHeight - 30;
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
    
    let dim = board_y - 50;
    

    boardFrame.style.width = board_x + 'px';
    boardFrame.style.height = board_y + 'px';
    board.style.width = dim + 'px';
    board.style.height = dim + 'px';
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

    $('#room-name').val('');
    $('#room-name').attr('placeholder', 'room name');
    $('#room-plus').show();
    $('#room-name').hide();

    resetConfig();
    $('#message').html('waiting for second player');

    emit.createRoom(room);

    emit.updateClientGrid(room);

    
    emit.updateScore(room, scoreObj);

    $('#boardFrame').fadeIn(fadeTime);
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
        emit.updateScore(room, scoreObj)

        emit.joinRoom(room);

        playerArr = [];
        scoreObj = {};
        updateButtons();
        $('#boardFrame').fadeOut(fadeTime);
    });
}

function addOnclick_JOIN( roomName ) {
    $('#message').html('');
    $(roomName).html('JOIN');
    $(roomName).off('click');
    $(roomName).on('click', () => {
        room = roomName.slice(4);
        let playerNum = $(`#rm-${room} >`).length;
        if ( playerNum < playerLimit ) {

            resetConfig();
            // revertStoneCSS();
            // countArr = [];
            // passCount = 0;
            // scoreObj[name] = 0;

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
                // showCountArr();
                console.log('nothing to do here');
            break;
            default:
                console.log('this option does not exist');
        }        
    }

    function putStone(index) {

        let stone = gridArr[index];

        if (config.strict) {
            // IF config is set to strict...
            // You cannot play alone.
            // You cannot play out of turn.
            // You cannot remove your own stone.
            if (playerArr.length == 1) return;
            if (playerArr[0] != name ) {
                $('#message').html('nacho turn');
                return;
            }
            if (stone == name) return;
        }

        emit.pass(room, passCount=0);
        $('#message').html('');

        if (stone == name) { gridArr[index] = noName; }
        else if (stone == noName) { gridArr[index] = name; }
        else { return; }

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

    function countStone(index) {
        let stone = gridArr[index];
        if ( stone == name ) return;
        if ( stone == noName ) return;
        console.log( stone );

        scoreObj[stone]--;
        gridArr[index] = noName;

        updateLocalGrid( gridArr );
        GridArrToGame_Rox();
        changeScore();
        emit.updateServerGrid(gridArr);

    }

}








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
        $('#players').append(`<div style="color: ${colorObj[player]}">&#11044;</div>`);
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
        $('.square').eq(i).css('stroke', colorObj[_name]);
        $('.square').eq(i).css('stroke-width', '4');
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
        $(`div[id="rm-${obj.room}"]`).append(`<div ${a}>${b} ${c}</div>`);
    });
}

function revertStoneCSS() {
    
    countArr.forEach( (_name, i) => {
        if ( _name == noName ) return;
        $('.square').eq(i).css('fill', "#fff0" );
        $('.square').eq(i).css('stroke-width', 0);
        $('.square').eq(i).css('r', 46);
    });
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
        $('#message').html('nacho turn');
        return;
    }
    passCount++;
    console.log('passCount is', passCount);
    emit.pass(room, passCount);
    $('#message').html('pass!');
    shiftPlayerList();
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
    updateServerGrid : (gridArr) => { socket.emit('update grid on server', gridArr); },
    pass : (room, passCount) => { socket.emit('update pass', room, passCount )} 
    
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


socket.on('update color', arr => {
    let array = arr;
    console.log(arr);
    
});


socket.on('update player list', updatedPlayerList => {
    let num1 = playerArr.length;
    let num2 = updatedPlayerList.length;
    if ( num1==1 && num2==2 ) {
        $('#message').html('second player joined. begin game.');
    }

    playerArr = updatedPlayerList;
    let str = `<div>${updatedPlayerList[0]}'s turn!</div>`;
    $('#turn').html(str);
    showScoreboard(scoreObj);
});


socket.on('update grid', (colorObject, name_grid) => {
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
    // console.log('this many people passed', passCount);
    if ( passCount == playerArr.length ) {

        if (stage.stat == 'fight') {
            stage.clean();
            passCount = 0;
            emit.pass(room, passCount);
            $('#message').html('All players passed. Remove dead stones. ');
        } else if (stage.stat == 'clean' ) {
            stage.count();
            passCount = 0;
            emit.pass(room, passCount);
            showCountArr();
            $('#message').html('Game has ended. Go home. ');
        }

        
    }
})




// ___________________________________ SOCKET ON EVENTS (END)

// __________________________________________EVERYTHING (END)