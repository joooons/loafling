
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
    this.teams = [];
    this.walls = [];
}

const NESW = [{x:-1,y:0}, {x:0,y:1}, {x:1,y:0}, {x:0,y:-1}];









// LOCAL FUNCTIONS (MAIN) ________________________________________

function Game_RoxToGridArr() {
    let roster = _.uniq(gridArr);
    roster.forEach( name => {
        Game_Rox[name].total.forEach( pos => {
            gridArr[pos-1] = name;
        });
    });
}



function GridArrToGame_Rox() {
    let roster = _.uniq(gridArr);
    roster.forEach( name => {
        Game_Rox[name] = new Rox();
        gridArr.forEach( (val, index) => {
            if ( name == val ) {
                Game_Rox[name].total.push(index+1);
            }
        });
        Game_Rox[name].walls = arrWalls( Game_Rox[name].total );
    });
}



function arrNESW(pos) {
    // INPUT: number that indicates position on the grid, 
    // ...counting from left top, moving right.
    // NOTE: "pos" is not the same is "index".
    // The lowest value of pos is 1, not 0.
    // OUTPUT: array of "pos" values of positions that surround 
    // ...the original pos, minus whatever is outside the boundaries.
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



function arrWalls(total) {
    // INPUT: Game_Rox[player].total.
    // OUTPUT: array of positions that surrounds all of the positions
    // ... in Game_Rox[player].total. 
    let arr = [];
    total.forEach( val => {
        arr = _.union( arr, arrNESW(val) );
    });
    arr = _.difference(arr, total);
    sortA(arr);
    return arr;
}



function publishToConsole() {
    console.clear();
    console.log('%croxTotal', 'font-weight: bold; color: orange;');
    console.table(roxTotal);
    console.log('%croxTeams', 'font-weight: bold; color: orange;');
    console.table(roxTeams);
    console.log('%croxWalls', 'font-weight: bold; color: orange;');
    console.table(roxWalls);
    console.log(' ---------------- ');
}






























// LOCAL FUNCTIONS (MINI) ________________________________________

function XYtoPOS(x, y) { return x + boardDim * ( y - 1 ); }
function POStoX(pos) { return (pos - 1) % boardDim + 1; }
function POStoY(pos) { return ( ( pos - POStoX(pos, boardDim) ) / boardDim) + 1; }
function sortA(arr) { arr.sort( (a,b) => {return a-b} ); }
function sortD(arr) { arr.sort( (a,b) => {return b-a} ); }






