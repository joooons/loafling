
console.log('mathbank.js at your service!');







// NOTES ON EXTERNAL VARIABLES ___________________________________

// var gridArr = [];
    // This is a local single value array of the names in each of the squares.
    // The index of the array corresponds to the position in the board.

// var boardDim = 5;
    // The length of the side of the board in terms of number of squares.




// LOCAL VARIABLES _______________________________________________

const Game_Rox = {};

function Rox () {
    this.total = [];
        // Array of "pos" belonging to player
    this.teams = [];
        // Array of arrays of "pos" that are contiguous
    this.walls = [];
        // Array of arrays of "pos" that surround each "team"
}

const NESW = [{x:-1,y:0}, {x:0,y:1}, {x:1,y:0}, {x:0,y:-1}];
var teamArray = [];







// LOCAL FUNCTIONS (MAIN) ________________________________________

function Game_RoxToGridArr() {
    let roster = _.uniq(gridArr);
    roster.forEach( name => {
        Game_Rox[name].total.forEach( pos => gridArr[pos-1] = name );
    });
}



function GridArrToGame_Rox() {
    // console.clear();
    let roster = _.uniq(gridArr);
    roster.forEach( name => {
        Game_Rox[name] = new Rox();
        gridArr.forEach( (val, index) => {
            if ( name == val ) Game_Rox[name].total.push(index+1);
        });
        let total = Game_Rox[name].total;
        arrTeams(total);
        Game_Rox[name].teams = teamArray;
        teamArray = [];
        let walls = [];
        Game_Rox[name].teams.forEach( team => walls.push(arrWalls(team)) );
        Game_Rox[name].walls = [...walls];
        if ( name!= noName ) showRox(name);
    });
}





function arrNESW(pos) {
    let x = POStoX(pos);
    let y = POStoY(pos);
    let arr = [];
    NESW.forEach( coord => {
        let xn = x + coord.x;
        let yn = y + coord.y;
        let test = ( (xn>0)&&(yn>0)&&(xn<=boardDim)&&(yn<=boardDim) );
        if (test) arr.push( XYtoPOS(xn, yn) );
    });
    sortA(arr);
    return arr;
}






function arrWalls(team) {
    let arr = [];
    team.forEach( val => arr = _.union(arr, arrNESW(val)) );
    arr = _.difference(arr, team);
    sortA(arr);
    return arr;
}



function arrTeams(team) {
    // Before using this function, you need to set teamArray = [];
    let arrNew = [];
    let arrOld = [...team];
    if (arrOld.length) {
        arrNew.push( arrOld.pop() );
        spreadAndPush( arrNew[0] );
        function spreadAndPush(val) {
            arrNESW(val).forEach( pos => {
                if ( arrOld.includes(pos) ) {
                    arrNew.push(pos);
                    arrOld = _.without( arrOld, pos);
                    spreadAndPush(pos);
                }
            });
        }
        sortA(arrNew);
        teamArray.push(arrNew);
    }
    if (arrOld.length) arrTeams(arrOld);
}





function showRox(name) {
    // console.clear();
        // console.log('   NO showRox()');
    // console.log(`----------${name}-------------`);
    // console.log('%ctotal', 'font-weight: bold; color: orange;');
    // console.table(Game_Rox[name].total);
    // console.log('%cteams', 'font-weight: bold; color: orange;');
    // console.table(Game_Rox[name].teams);
    // console.log('%cwalls', 'font-weight: bold; color: orange;');
    // console.table(Game_Rox[name].walls);
    // console.log('     ');
}






























// LOCAL FUNCTIONS (MINI) ________________________________________

function XYtoPOS(x, y) { return x + boardDim * ( y - 1 ); }
function POStoX(pos) { return (pos - 1) % boardDim + 1; }
function POStoY(pos) { return ( ( pos - POStoX(pos, boardDim) ) / boardDim) + 1; }
function sortA(arr) { arr.sort( (a,b) => {return a-b} ); }
function sortD(arr) { arr.sort( (a,b) => {return b-a} ); }






