// Constants
const colorCodes = ['none', 'green', 'purple', 'orange', 'yellow', 'blue', 'red', 'white', 'black']; // 0-8 are the color codes and correspond with the position in the array.

// Sound
function playSound() {
    new Audio('audio/plop.mp3').play();
}

// Colors
let greenBtn = document.getElementById('color1');
let purpleBtn = document.getElementById('color2');
let orangeBtn = document.getElementById('color3');
let yellowBtn = document.getElementById('color4');
let blueBtn = document.getElementById('color5');
let redBtn = document.getElementById('color6');

// Remove or Accept
let sendBtn = document.getElementById('send-btn');
let removeBtn = document.getElementById('remove-btn');

// Black or White
let whiteBtn = document.getElementById('white');
let blackBtn = document.getElementById('black');

// Color click events
greenBtn.addEventListener('click', function(){
    addColor(1);
});
purpleBtn.addEventListener('click', function(){
    addColor(2);
});
orangeBtn.addEventListener('click', function(){
    addColor(3);
});
yellowBtn.addEventListener('click', function(){
    addColor(4);
});
blueBtn.addEventListener('click', function(){
    addColor(5);
});
redBtn.addEventListener('click', function(){
    addColor(6);
});

// Black & white
whiteBtn.addEventListener('click', function(){
    addColor(7);
})
blackBtn.addEventListener('click', function(){
    addColor(8);
})

// Accept event
sendBtn.addEventListener('click', function(){
    if(boardType === null) {
        return;
    }
    sendRow();
});

// Remove event
removeBtn.addEventListener('click', function(){
    playSound();
    removeColor();
});

// Vars used for comparing if the given pins from P1 are correct
var theHiddenColor = null;
var theGuessedColor = null;

// Changing variables
var boardType = null; // board can either be 'color', 'pin' 'secretColor'
var boardRow = 0; // Depends on the row seen in an array (amount of guesses made basically(amount of guesses is incremented after pins have been sent to server))
var commSocket = null;
var boardMessages = null;

// Functions
let currentColRow = [0,0,0,0];
let columnPosition = 0;

function addColor(color) { // board can either be 'color', 'pin' 'secretColor'
    let row = boardRow;
    let htmlRow = row + 1;
    let htmlColumn = columnPosition + 1;

    if(boardType === null) {
        return;
    }

    if(boardType === "color" || boardType === "secretColor") {
        for(i = 0; i < 4; i++) {
            if(currentColRow[i] === color) {
                console.log("This color is already in the current row");
                return;
            }
        }
    }

    if(columnPosition === 4) {
        console.log("The current row is full");
        return;
    }

    else {
        if(boardType === "color" && !([7,8].includes(color))) {
            document.getElementById('row' + htmlRow).querySelector('.col' + htmlColumn).classList.add(colorCodes[color]);
        }
        else if(boardType === "pin" && !([1,2,3,4,5,6].includes(color))) {
            document.getElementById('row' + htmlRow).querySelector('.pin' + htmlColumn).classList.add(colorCodes[color]);
        }
        else if(boardType === "secretColor" && !([7,8].includes(color))){
            document.getElementById('secretCode').querySelector('.col' + htmlColumn).classList.add(colorCodes[color]);
        }
        else {
            return;
        }

        currentColRow[columnPosition] = color;
        columnPosition++;
    }

}

// Remove color function
function removeColor() { // board can either be 'color', 'pin' 'secretColor'
    let row = boardRow;
    let htmlRow = row + 1;
    let htmlColumn = columnPosition;

    if(columnPosition === 0 || boardType === null) {
        return;
    }
    if(boardType === "color") {
        document.getElementById('row' + htmlRow).querySelector('.col' + htmlColumn).classList.remove(colorCodes[currentColRow[columnPosition-1]]);
    }
    if(boardType === "pin") {
        document.getElementById('row' + htmlRow).querySelector('.pin' + htmlColumn).classList.remove(colorCodes[currentColRow[columnPosition-1]]);
    }
    if(boardType === "secretColor"){
        console.log("Column trying to remove:" + htmlColumn + " The row in js: " + currentColRow);
        document.getElementById('secretCode').querySelector('.col' + htmlColumn).classList.remove(colorCodes[currentColRow[columnPosition-1]]);
    }
    currentColRow[columnPosition-1] = 0;
    columnPosition--;

}

// add Row function 
function addRow(arr) {
    if(boardType === null) {
        rerturn;
    }

    //boardRow = row;

    for(let i = 0; i < 4; i++) {
        addColor(arr[i]);
    }
    // reset used variables
    columnPosition = 0;
    currentColRow = [0,0,0,0];
}

// Send row function
function sendRow() {
    if((boardType === "color" || boardType === "secretColor") && columnPosition != 4) {
        document.getElementById('status').innerHTML = 'Fill in 4 colors before sending!';
        return;
    }

    if(boardType === "pin") {
        if(!(checkCorrectPins(theHiddenColor, theGuessedColor, currentColRow))) {
            return;
        }
    }
    
    playSound();

    if(boardType === "secretColor") {
        var msg = boardMessages.CREATED_SECRET_COLOR;
        document.querySelector('.colors').classList.add('hidden');
        theHiddenColor = currentColRow;
    }
    if(boardType === "color") {
        var msg = boardMessages.COLOR_GUESS;
    }
    if(boardType === "pin") {
        var msg = boardMessages.COLOR_CHECK;
    }

    msg.data = currentColRow;
    msg = JSON.stringify(msg);
    commSocket.send(msg);
    
    currentColRow = [0,0,0,0];
    columnPosition = 0;
    boardType = null;
    commSocket == null;

    // Remove visibilty of normal colors
}

function checkCorrectPins(secret, given, givenPins) {
    let amountBlack = 0;
    let amountWhite = 0;
    for(i = 0; i < given.length; i++) {
        if (secret[i] === given[i]) {
            amountBlack++;
        }
        else if(secret.includes(given[i])){
            amountWhite++;
        }
    }

    let compareBlack = 0;
    let compareWhite = 0;
    for(i = 0; i < givenPins.length; i++) {
        if(givenPins[i] === 8) {
            compareBlack++;
        }
        if(givenPins[i] === 7) {
            compareWhite++;
        }
    }

    if((compareBlack === amountBlack) && (compareWhite === amountWhite)) {
        return true;
    }
    else {
        document.getElementById('status').innerHTML = "Make sure the amount of black and white pins are correct!";
        return false;
    }

}

