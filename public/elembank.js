

console.log('elembank.js at your service!');



// LOCAL VARIABLES _________________________________________________

const ns = "http://www.w3.org/2000/svg";

var svgElem;




// SVG bank ____________________________________________________

const svgArt = {};
// svgArt.arrow = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-right-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path fill-rule="evenodd" d="M7.646 11.354a.5.5 0 0 1 0-.708L10.293 8 7.646 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0z"/><path fill-rule="evenodd" d="M4.5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/></svg>';
svgArt.circle = '<svg width="1em" height="0.8em" viewBox="0 0 16 16" class="bi bi-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"/></svg>';
svgArt.arrow = '<svg width="1em" height="0.9em" viewBox="0 0 16 16" class="bi bi-arrow-right" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.146 4.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L12.793 8l-2.647-2.646a.5.5 0 0 1 0-.708z"/><path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5H13a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8z"/></svg>';















// LOCAL FUNCTIONS _________________________________________________

function addSVGtoBoard( elem, num ) {
    $(elem).html('');
    // RESET the contents of 'board'

    let xDim = 100 * num;
    let yDim = 100 * num;
    // let svg = document.createElementNS(ns, 'svg');
    //     svg.setAttributeNS( null, "viewBox", `0 0 ${xDim} ${yDim}`);
    svgElem = document.createElementNS(ns, 'svg');
        svgElem.setAttributeNS( null, "viewBox", `0 0 ${xDim} ${yDim}`);
        addGridLines( svgElem, xDim, yDim, num );
        addClickableDots(svgElem, num);
    $(elem).append(svgElem);
}



function addGridLines( elem, xDim, yDim, num ) {
    for ( i=0 ; i<num ; i++ ) {
        let lineH = document.createElementNS(ns, 'line');
            $(lineH).attr('x1', 50);
            $(lineH).attr('y1', 50 + (100 * i) );
            $(lineH).attr('x2', xDim - 50);
            $(lineH).attr('y2', 50 + (100 * i) );
            $(lineH).attr('stroke-width', '5px');
            $(lineH).attr('stroke-linecap', 'round');
            $(lineH).attr('stroke', '#222');
        let lineV = document.createElementNS(ns, 'line');
            $(lineV).attr('y1', 50);
            $(lineV).attr('x1', 50 + (100 * i) );
            $(lineV).attr('y2', xDim - 50);
            $(lineV).attr('x2', 50 + (100 * i) );
            $(lineV).attr('stroke-width', '5px');
            $(lineV).attr('stroke-linecap', 'round');
            $(lineV).attr('stroke', '#222');
        $(elem).append(lineH);
        $(elem).append(lineV);
    }
}



function addClickableDots( elem, num) {
    for ( j=0 ; j<num ; j++ ) {
        for ( i=0 ; i<num ; i++ ) {
            let index = (j*num) + i;
            let circ = document.createElementNS(ns, 'circle');
                $(circ).attr('cx', (100*i) + 50 );
                $(circ).attr('cy', (100*j) + 50 );
                $(circ).attr('r', 46);
                $(circ).attr('fill', '#fff0');
                $(circ).attr('class', 'square');
                addOnclick_putStone( circ, index);
            $(elem).append(circ);
        }
    }
}




// _______________________________________________ END OF EVERYTHING

