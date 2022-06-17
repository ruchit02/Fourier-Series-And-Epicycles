var canvas = document.getElementById("canvas");
var gContext = canvas.getContext("2d");

function setUpCanvas(){

    gContext.fillStyle = 'rgba(0, 0, 0, 1)';
    gContext.fillRect(0, 0, 1000, 600);
    gContext.strokeStyle = "rgba(128,240,255,1)";
}

let completeSignal = [-47,-1,62,0,-47,-1,62,0,-50,-1,60,0,-51,-1,63,0,-52,-1,64,0,-51,-1,63,0,-51,-1,63,0,-49,-1,60,0,-49,-1,59,0,-50,-1,65,0,-50,-1,67,0,-50,-1,63,0,-54,-1,65,0,-49,-1,64,0,-52,-1,64,0,-51,-1,62,0,-54,-1,68,0,-54,-1,66,0,-54,-1,67,0,-49,-1,70,0,-48,-1,71,0,-48,-1,67,0,-49,-1,68,0,-47,-1,66,0,-49,-1,67,0,-46,-1,65,0,-47]

let x = [];
let y = [];

let sortedX = [];
let sortedY = [];

let somePointer = 0 ;

for(let i = 0 ; i < completeSignal.length ; i=i+2 ){

    x[somePointer] = completeSignal[i];
    y[somePointer] = completeSignal[i+1];

    sortedX[somePointer] = completeSignal[i];
    sortedY[somePointer] = completeSignal[i+1];

    ++somePointer;
}

sortedX.sort( (x1,x2) => x1-x2 );
sortedY.sort( (y1,y2) => y1-y2 );

let leftmostPoint = sortedX[ 0 ];
let bottommostPoint = sortedY[ 0 ];

let rightmostPoint = sortedX[ sortedX.length-1 ];
let topmostPoint = sortedY[ sortedY.length-1 ];

let xMidpoint = leftmostPoint + (rightmostPoint-leftmostPoint)/2;
let yMidpoint = bottommostPoint + (topmostPoint-bottommostPoint)/2;

for( let i = 0 ; i < x.length ; ++i ){

    x[i] = x[i] - xMidpoint;
    y[i] = y[i] - yMidpoint;
}

let N = x.length ;
let timeInstance = [];
let samplingPeriod = 1/x.length ;
let periodInRadians = (2*Math.PI)*samplingPeriod ;
let sinusoids = 32;

let fourier = [];

for( let i = 0 ; i < N ; ++i ){

    timeInstance[i] = i*periodInRadians ;
}

function interpolate( t, xCo, yCo ){

    if( xCo.length !== yCo.length ){

        throw new Error("Number of x-coordinates and y-coordiates dont match");
    }

    let slopes = [];
    let counter = 0;
    let x1 = 0 ;
    let y1 = 0 ;
    let x2 = 0 ;
    let y2 = 0 ;
    let slope = 0;

    while( counter <= xCo.length-2 ){

        x1 = xCo[ counter ];
        y1 = yCo[ counter ];

        x2 = xCo[ counter+1 ];
        y2 = yCo[ counter+1 ];

        slope = (y2-y1) / (x2-x1);

        slopes[counter] = slope;

        ++counter;
    }

    counter = -1 ;
    x1 = xCo[0];
    y1 = 0;
    x2 = 0;
    

    for( let value of xCo ){

        if( t > value ){

            x1 = value;
            ++counter;
        }else{ break; }
    }

    if( counter === -1 ){ counter = 0 ; }

    x2 = t;
    y1 = yCo[counter];

    slope = slopes[counter];

    y2 = slope*(x2-x1) + y1;

    return y2;
}

function areaOfRectangle( length, breadth ){

    return length*breadth;
}

function calcCoEff(){

    let order = sinusoids ;

    let realCoEff = 0 ;
    let imgnCoEff = 0 ;
    
    let scalar = 0;

    for( let n = -order ; n < (order+1) ; ++n){

        realCoEff = 0;
        imgnCoEff = 0;
        scalar = 0 ;

        for( let t of timeInstance ){

            let realPart = interpolate( t, timeInstance, x )*Math.cos( n*t ) 
                         + interpolate( t, timeInstance, y )*Math.sin( n*t );

            let realArea = areaOfRectangle( realPart, periodInRadians );

            realCoEff = realCoEff + realArea;

            let imgnPart = interpolate( t, timeInstance, y )*Math.cos( n*t )
                         - interpolate( t, timeInstance, x )*Math.sin( n*t );
                         
            let imgnArea = areaOfRectangle( imgnPart, periodInRadians );

            imgnCoEff = imgnCoEff + imgnArea ;
        }

        scalar = 2/(2*Math.PI);
        realCoEff = realCoEff*scalar;
        imgnCoEff = imgnCoEff*scalar;

        let radius = Math.sqrt( (realCoEff*realCoEff) + (imgnCoEff*imgnCoEff) );

        fourier[n+order] = {
            a         : realCoEff,
            b         : imgnCoEff,
            amplitude : radius,
            frequency : n
        };
    }

    fourier.sort( (elem1,elem2) => elem2.amplitude - elem1.amplitude );
    let greatestAmp       = fourier[0].amplitude ;

    for( let value of fourier ){
        
        value.a         = (value.a/greatestAmp)*150;
        value.b         = (value.b/greatestAmp)*150;
        value.amplitude = (value.amplitude/greatestAmp)*150;
    }
}

let degToRad = function(degrees){
    let angle = degrees;
    return angle*(Math.PI/180);
}

function drawCircle(xVal, yVal, radX, radY){

    gContext.strokeStyle = "rgba(255,240,128,0.2)";

    gContext.beginPath();
    gContext.ellipse(xVal, yVal, radX, radY, 0, 0, 2*Math.PI);
    gContext.stroke();
    gContext.closePath();
}

function drawRadius(x1, y1, x2, y2){

    gContext.strokeStyle = "rgba(255,240,128,1)";

    gContext.beginPath();
    gContext.moveTo(x1, y1);
    gContext.lineTo(x2, y2);
    gContext.stroke();
    gContext.closePath();
}

function wavePlotter(){

    for( let value of path ){

        gContext.beginPath();
        gContext.ellipse(value.endX, value.endY, 0.5, 0.5, 0, 0, 2*Math.PI);
        gContext.stroke();
        gContext.closePath();
    }
}

function epicycles(pointX, pointY){

    let t = timeInstance[someInstance];

    let centX = pointX;
    let centY = pointY;
    let nextX = centX;
    let nextY = centY;

    for( let value of fourier ){

        centX = nextX;
        centY = nextY;

        let radius = value.amplitude ;

        let xT = value.a*Math.cos( value.frequency*t ) + value.b*Math.sin( value.frequency*t );
        let yT = value.b*Math.cos( value.frequency*t ) - value.a*Math.sin( value.frequency*t );
        
        nextX = centX + xT;
        nextY = centY + yT;

        drawCircle(centX, centY, radius, radius);
        drawRadius(centX, centY, nextX , nextY);
    }
    
    return {endX : nextX, endY : nextY};
}

function executor(){

    setUpCanvas();

    let realPoint      = epicycles(500,300);

    gContext.strokeStyle = "rgba(128,240,255,1)";

    path.push( realPoint );
    wavePlotter();
    ++someInstance;

    if( someInstance > timeInstance.length ){
        someInstance = 0 ;
        //path.length = 0;
    }
}

calcCoEff() ;
let pointer = 0 ;
let path = [];

let displacedX = 0;
let displacedY = 0;

let someInstance = 0;

setInterval( executor, 5 );