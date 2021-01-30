
var Messages = require("./messages");
var messages = Messages.messages;

var game = function(gameId) {
    this.player1 = null;
    this.player2 = null;
    this.id = gameId;
    this.colorsToGuess = null; 
    this.lastPins = null;
    this.lastColors = null;
    this.winConditionPins = [8,8,8,8];
    this.gameState = "0 PLAYERS";
    this.totalGuesses = 0;  // amount of completed rounds
    this.maxGuesses = 15;   // max amount of rounds
    this.winner = null;
    this.aborted = null;
};

game.prototype.allStates = {
    "0 PLAYERS" : 0,
    "1 PLAYER" : 1,
    "2 PLAYERS" : 2,
    "1: COLOR" : 3,     // Player1 must fill in a color to be guessed
    "2: GUESS" : 4,     // Player2 must make a guess
    "1: PINS" : 5,      // Player1 must fill in the pins about the guess from player2
    "1" : 6,            // Player1 won
    "2" : 7,            // Player2 won
    "ABORTED" : 8       // Game was aborted
};

game.prototype.checkState = function(a) {
    return (a in this.allStates);
};

game.prototype.checkTransition = function(now, toBe) {
    // Check if the given states are in allStates
    if(!(now in game.prototype.allStates) || !(toBe in game.prototype.allStates)) {
        return false;
    }
    let nowNumber = game.prototype.allStates[now];
    let toBeNumber = game.prototype.allStates[toBe];

    // Check if the Transition is valid

    // Some explicit NOT valid transitions
    if((nowNumber === 6 && toBeNumber === 8)        // from win player 1 to abortion 
        || (nowNumber === 7 && toBeNumber === 8)    // from win player 2 to abortion 
        || (nowNumber === 8 && toBeNumber === 8)) { // from abortion to abortion 
        return false;
    }
    
    if(
        (nowNumber === 0 && toBeNumber == 1)        // 0 players ==> 1 player
        || (nowNumber === 1 && toBeNumber === 2)    // 1 player ==> 2 players
        || (nowNumber === 1 && toBeNumber === 0)    // 1 player ==> 0 players
        || (nowNumber === 2 && toBeNumber === 3)    // 2 player ==> player1 inserting secretColor
        || (nowNumber === 3 && toBeNumber === 4)    // player1 inserting secretColor ==> player2 guessing it
        || (nowNumber === 4 && toBeNumber === 5)    // player2 guessing ==> player1 filling in pins
        || (nowNumber === 5 && toBeNumber === 4)    // player1 filling in pins ==> player2 guessing color
        || (nowNumber === 5 && toBeNumber === 6)    // player1 filling in pins ==> player1 wins
        || (nowNumber === 5 && toBeNumber === 7)    // player1 filling in pins ==> player2 wins
        || (toBeNumber === 8)                       // Game aborted
        ) {
            return true;
        }
    else {
        return false;
    }

};

game.prototype.setGameState = function(newState) {
    if( game.prototype.checkState(newState) 
        && game.prototype.checkTransition(this.gameState, newState)) {
            this.gameState = newState;
            console.log("New game state from game: %s, is now: %s", this.id, this.gameState);
            return true;
        }
    else {
        return false;
    }
};

game.prototype.addPlayer = function(ws) {

    // Check if the call is correct
    if(this.gameState != "0 PLAYERS" && this.gameState != "1 PLAYER") {
        console.log("Invalid call to addPlayer, current State is: %s", this.gameState);
        return;
    }


    var status1 = this.setGameState("1 PLAYER");
    if(!status1) {
        this.setGameState("2 PLAYERS");
    }


    if(this.player1 == null) {
        this.player1 = ws;    
        return "PLAYER 1";
    }
    else {
        this.player2 = ws;
        return "PLAYER 2";
    }


};

game.prototype.startGame = function() {

    if(this.gameState == "2 PLAYERS") {
        if(this.checkTransition(this.gameState, "1: COLOR")) {
            this.setGameState("1: COLOR");
        }
    }

    if(this.gameState === "1: COLOR") {
        // Send message to player 1
        var msg = messages.MAKE_SECRET_COLOR;
        msg = JSON.stringify(msg);
        this.player1.send(msg);

        // Send message to player 2
        var msg = messages.WAITING_FOR_SECRET;
        msg = JSON.stringify(msg);
        this.player2.send(msg);
    }
};

game.prototype.enterSecretColor = function(theForbiddenColor) {
    if(!(Array.isArray(theForbiddenColor))) {
        return false;
    }
    else {
        this.colorsToGuess = theForbiddenColor;
        console.log(theForbiddenColor);
    }
    return this.goToState4();
};

game.prototype.goToState4 = function() {
    if(this.colorsToGuess == null) {
        return false;
    }
    if(this.checkTransition(this.gameState, "2: GUESS")) {
        this.setGameState("2: GUESS");
    }
    

    if(this.gameState === "2: GUESS") {
        var msg = messages.PLAYER_1_WAITING;
        msg = JSON.stringify(msg);
        this.player1.send(msg);
        
        var msg = messages.PLAYER_2_GUESSING;
        msg.data = [this.totalGuesses, this.lastPins]; // Sends the current round and the pins from Player 1
        msg = JSON.stringify(msg);
        this.player2.send(msg);
    }
};

game.prototype.goToState5 = function(arr) {
    console.log(arr);
    this.lastColors = arr;

    if(this.checkTransition(this.gameState, "1: PINS")) {
        this.setGameState("1: PINS");
    }

    if(this.gameState === "1: PINS") {
        var msg = messages.PLAYER_1_CORRECTING;
        msg.data = [this.totalGuesses, this.lastColors];
        msg = JSON.stringify(msg);
        this.player1.send(msg);

        var msg = messages.PLAYER_2_WAITING;
        msg = JSON.stringify(msg);
        this.player2.send(msg);
    }
}

game.prototype.checkWin = function(arr) {
    this.lastPins = arr;
    this.totalGuesses++;
    //========================
    // WIN CONDITION
    //========================
    if(JSON.stringify(this.lastPins) === JSON.stringify(this.winConditionPins)) {
        this.winner = "PLAYER 2";
    }
    if(this.totalGuesses === this.maxGuesses) {
        this.winner = "PLAYER 1";
    }

    if(this.winner === "PLAYER 1") {
        // Send win to player 1
        var msg = messages.PLAYER_1_WINS;
        msg = JSON.stringify(msg);
        this.player1.send(msg);

        // Send lost to player 2
        var msg = messages.PLAYER_2_LOSES;
        msg.data = [this.totalGuesses, this.lastPins];
        msg = JSON.stringify(msg);
        this.player2.send(msg);
    }

    else if(this.winner === "PLAYER 2") {
        // Send lost to player 1
        var msg = messages.PLAYER_1_LOSES;
        msg = JSON.stringify(msg);
        this.player1.send(msg);

        // Send win to player 2
        var msg = messages.PLAYER_2_WINS;
        msg.data = [this.totalGuesses, this.lastPins];
        msg = JSON.stringify(msg);
        this.player2.send(msg);
    }
    
    else if(this.winner === null) {
        this.goToState4();
    }

    else {
        console.log("ERROR: WINNER NOT NULL BUT NO WINNER????")
    }
}

game.prototype.checkAborted = function() {
    if(this.gameState === "1 PLAYER") {
        this.gameState = "0 PLAYERS";
        try {
            this.player1.close();
            this.player1 = null;
        } catch (error) {
            console.log("Player 1 closing " + error);
        }
        // try {
        //     this.player2.close();
        //     this.player2 = null;
        // } catch (error) {
        //     console.log("Player 2 closing " + error);
        // }
        return false;
    }
    
    if(this.checkTransition(this.gameState, "ABORTED")) {
        this.setGameState = "ABORTED";
        try {
            this.player1.close();
            this.player1 = null;
        } catch (error) {
            console.log("Player 1 closing " + error);
        }
        try {
            this.player2.close();
            this.player2 = null;
        } catch (error) {
            console.log("Player 2 closing " + error);
        }
        return true;
    }
}


module.exports = game; // This way we can require ./game in app.js
