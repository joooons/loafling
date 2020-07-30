
console.log('mathbank.js at your service!');







// NOTES ON EXTERNAL VARIABLES ___________________________________

// var gridArr = [];
    // This is a local single value array of the names in each of the squares.
    // The index of the array corresponds to the position in the board.





// LOCAL VARIABLES _______________________________________________

const Game_Rox = {};


function Rox () {
    this.total = [];
    this.teams = [];
    this.walls = [];
}





function Game_RoxToGridArr() {
    let roster = _.uniq(gridArr);
    roster.forEach( name => {
        Game_Rox[name].total.forEach( index => {
            gridArr[index] = name;
        });
    });
}



function GridArrToGame_Rox() {
    let roster = _.uniq(gridArr);
    roster.forEach( name => {
        Game_Rox[name] = new Rox();
        gridArr.forEach( (val, index) => {
            if ( name == val ) {
                Game_Rox[name].total.push(index);
            }
        });
    });
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



// LOCAL MINI FUNCTIONS __________________________________________

function XYtoPOS(x, y, dim) { return x + dim * ( y - 1 ); }
function POStoX(pos, dim) { return (pos - 1) % dim + 1; }
function POStoY(pos, dim) { return ( ( pos - POStoX(pos, dim) ) / dim) + 1; }
function sortA(arr) { arr.sort( (a,b) => {return a-b} ); }
function sortD(arr) { arr.sort( (a,b) => {return b-a} ); }






