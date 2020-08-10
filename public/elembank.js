

console.log('elembank.js at your service!');



// LOCAL VARIABLES _________________________________________________

const ns = "http://www.w3.org/2000/svg";

var svgElem;








// LOCAL FUNCTIONS _________________________________________________

function addSVGtoBoard( elem, num ) {
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

