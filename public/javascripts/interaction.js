

function gameInfo(socket) {
    this.playerType = null;
    this.wrongGuesses = 0;
    this.maxGuesses = 15;
    this.action = null;
    this.messages = {};
    this.socket = socket;
    this.winner = null;
    this.epicSecretColor = null;

    this.setPlayerType = function(newType) {
        this.playerType = newType;
    };

    this.getPlayerType = function() {
        return this.playerType;
    }

    this.getSocket = function() {
        return this.socket;
    }

}; // .gameInfo





(function setup() {
    const socket = new WebSocket("ws:24.132.126.223:25565/game"); // could also be localhost:3000
    
    //socket.onmessage = function(event){
    //};
    // socket.onopen = function(){
    // socket.send("Hello from the client!");
    // //target.innerHTML = "Sending a first message to the server ..."
    // };

    var gi = new gameInfo(socket);

    // Statistics updater
    let statisticsInterval = setInterval(function() {

        var msg = gi.messages.GET_STATISTICS;
        msg = JSON.stringify(msg);
        socket.send(msg);
        
    }, 10 * 1000);


    var date1 = new Date();
    var timeStart = date1.getTime();
    var minutes = 00;
    var myTimer = setInterval(timer, 1000);
    function timer() {
        var date2 = new Date();
        var seconds = Math.floor((date2.getTime() - timeStart)/1000);
        if(minutes < 10) {
            var minutesShow = "0" + minutes;
        }
        else {
            minutesShow = minutes;
        }
        if(seconds < 10) {
            var secondsShow = "0" + seconds;
        }                    
        else {
            secondsShow = seconds;
        }
        var update = minutesShow + ":" + secondsShow;
        document.getElementById("sessionTime").querySelector('span').innerHTML = update;
        if(seconds >= 59) {
            date1 = new Date();
            timeStart  = date1.getTime();
            minutes++;
        }
    }

    socket.onmessage = function(event) {
        
        let receivedMsg = JSON.parse(event.data);
        if(receivedMsg.code != "STATISTICS") {
            document.getElementById('status').innerHTML = receivedMsg.message;
        }
        gi.action = receivedMsg.code;

        // Console log for debugging and watching the game messages
        console.log(receivedMsg.message);

        
        /**
         * The first message with all client messages
        */
        if (receivedMsg.code === "MESSAGES") {
            
            // Set the variable of messages to messages pack from server
            gi.messages = receivedMsg.data;

            // Report back to server
            var msg = gi.messages.ENTER_GAME;
            msg = JSON.stringify(msg);
            socket.send(msg);

        }

        /**
         * Player type
         */
        if (receivedMsg.code === "PLAYER_1" || receivedMsg.code === "PLAYER_2") {
            gi.setPlayerType = receivedMsg.data;
            displayMessage(receivedMsg.message, "waiting for an opponent...");
            document.querySelector('.good-colors').classList.add('hidden');
            if(receivedMsg.code === "PLAYER_2") {
                document.getElementById('secretCode').classList.add('hidden');
            }

            // Ask for the first statistics :)
            var msg = gi.messages.GET_STATISTICS;
            msg = JSON.stringify(msg);
            socket.send(msg);
        }

        /**
         * FILLING IN SECRET COLOR
         */
        else if (receivedMsg.code === "MAKE_SECRET_COLOR") {
            hideMessage();
            boardType = 'secretColor';
            boardRow = 0;
            commSocket = gi.getSocket();
            boardMessages = gi.messages;
        }

        else if (receivedMsg.code === "WAITING_FOR_SECRET") {
            displayMessage("Opponents turn", receivedMsg.message);
        }

        /**
         * GameState Guessing
         */
        else if (receivedMsg.code === "PLAYER_2_GUESSING") {
            hideMessage();
            gi.wrongGuesses = receivedMsg.data[0];
            
            // Insert pins from previous round
            if(receivedMsg.data[0] != 0) {
                boardType = 'pin';
                boardRow = gi.wrongGuesses - 1; // Minus one because the row is from the previous round, which has been updated.
                addRow(receivedMsg.data[1]);
            }
            // Enable player 2 to sent a guess
            boardType = 'color';
            boardRow = gi.wrongGuesses; 
            commSocket = gi.getSocket();
            boardMessages = gi.messages;
        }

        else if (receivedMsg.code === "PLAYER_1_WAITING") {
            displayMessage("Opponents turn", receivedMsg.message);
            if(document.querySelector('.good-colors').classList.contains('hidden')) {
                document.querySelector('.good-colors').classList.remove('hidden');
            }
        }

        else if (receivedMsg.code === "PLAYER_1_CORRECTING") {
            hideMessage();
            gi.wrongGuesses = receivedMsg.data[0];

            // Add color guess from opponent
            boardType = 'color';
            boardRow = gi.wrongGuesses;
            console.log(boardRow + " and type is: " + (typeof boardRow));
            addRow(receivedMsg.data[1]);

            // Enable player 1 to correct
            theGuessedColor = receivedMsg.data[1];
            boardType = 'pin';
            boardRow = gi.wrongGuesses;
            commSocket = gi.getSocket();
            boardMessages = gi.messages;
        }

        else if (receivedMsg.code === "PLAYER_2_WAITING") {
            displayMessage("Opponents turn", receivedMsg.message);
        }

        /**
         * Players winning
         */
        else if (receivedMsg.code === "PLAYER_1_WINS") {
            displayMessage(receivedMsg.message, "<a href=\"/splash\">Want to try again?</a>");
            gi.winner = "PLAYER 1";
        }
        
        else if (receivedMsg.code === "PLAYER_2_LOSES") {
            displayMessage("You lost!", receivedMsg.message);
            gi.winner = "PLAYER 1";

            gi.wrongGuesses = receivedMsg.data[0];

            // Insert pins from previous round
            boardType = 'pin';
            boardRow = gi.wrongGuesses - 1; // Minus one because the row is from the previous round, which has been updated.
            addRow(receivedMsg.data[1]);
        }

        else if (receivedMsg.code === "PLAYER_2_WINS") {
            displayMessage(receivedMsg.message, "<a href=\"/splash\">Want to try again?</a>");
            gi.winner = "PLAYER 2";

            // Insert pins from previous round
            gi.wrongGuesses = receivedMsg.data[0];
            boardType = 'pin';
            boardRow = gi.wrongGuesses - 1; // Minus one because the row is from the previous round, which has been updated.
            addRow(receivedMsg.data[1]);
            
        }

        else if (receivedMsg.code === "PLAYER_1_LOSES") {
            displayMessage("You lost!", receivedMsg.message);
            gi.winner = "PLAYER 2";
        }

        else if (receivedMsg.code === "STATISTICS") {
            console.log("Statistics received.");
            document.getElementById('currentGames').querySelector('span').innerHTML = receivedMsg.data[0];
            document.getElementById('onlinePlayers').querySelector('span').innerHTML = receivedMsg.data[2];
        }


    }; // .socket.onmessage

    socket.onclose = function(event) {
        console.log("Losing power.. Closing down...");
        console.log(gi.winner);
        if(gi.winner === null) {
            displayMessage("Aborted", "Your opponent left the game.. <a href=\"/splash\">Start a new game!</a>");
            document.getElementById('status').innerHTML = "ABORTED";
        }

    };





})(); // Executes this function immediately!