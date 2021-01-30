/** TO DO:
 *  - Checking serverside
 *  - Server updating stats different
 *  - Cleaning up objects
 */


// Initialise requirements
const express = require("express");
const url = require("url");
const http = require("http");
const app = express();
const websocket = require("ws");

// Including the overal statistics, game, messages
var serverStatistics = require("./statTracker");
var Game = require("./game");  
var Messages = require("./messages");
var messages = Messages.messages;


// init server
let port = process.argv[2];
console.log("Now listening on port " + port);


/** 
 * redirects 
 */

// Use the correct view engine:
app.set("view engine", "ejs");

// Use the correct static files:
app.use(express.static(__dirname + "/public"));

//TODO: move to routes/index
app.get("/", (req, res) => {
    res.render("splash.ejs", {
      gamesStarted: serverStatistics.gamesStarted,
      gamesAborted: serverStatistics.gamesAborted,
      playersOnline: serverStatistics.playersOnline
    });
  });

// Redirect to the splash screen:
app.get("/splash", function(req, res){
    res.sendFile("/public/splash.html", { root: "./"});
});

// Redirect to the game screen
app.get("/game", function(req, res){
    res.sendFile("/public/game.html", { root: "./" });
    // Matchmaking: wait for player 2 or match against another player.
});

// Send 404
app.get("/*", function(req, res){
    res.send("(Error:404) Not a valid route ...");
});



// Websocket from the server => Object 'wss'
const server = http.createServer(app).listen(port);     // Starts listening for HTTP requests
const wss = new websocket.Server({server});             // Start the websocet server

var websockets = {}; // This is an object for all the games :)


// /*
// Clean-up of the WebSockets object
// */
// setInterval(function() {
//     for (let i in websockets) {
//         if(Object.prototype.hasOwnProperty(i)) {
//             let wsObject = websockets[i];
//             if(wsObject.winner != null || wsObject === "ABORTED") {
//                 delete wsObject[i];
//             }
//         }
//     }
//     //console.log(websockets);

//   }, 10 * 1000); // Every 10 minutes the websockets object is cleaned


var currentGame = new Game(serverStatistics.gamesStarted++);
var connectionId = 0;   // A new connectionId is created for each player that joins.

wss.on("connection", function(ws){

    ws.id = connectionId++;
    let inSplash = false;
    serverStatistics.playersOnline++;

    var msg = { code: "MESSAGES", data: Messages.clientMessages };
    msg = JSON.stringify(msg);
    ws.send(msg);


    ws.on("message", function incoming(message) {
        //console.log("[LOG]" + message);   
        
        parsedMSG = JSON.parse(message);

        console.log("[MSG] " + parsedMSG.message);


        /**
        *---------------------------------------------------------
        * GAME MESSAGES 
        *---------------------------------------------------------
        */
        if(parsedMSG.code === "ENTER_SPLASH") {
            inSplash = true;

            var msg = messages.STATISTICS;
            msg.data = [serverStatistics.gamesStarted, serverStatistics.gamesAborted, serverStatistics.playersOnline];
            msg = JSON.stringify(msg);
            ws.send(msg);

        }

        if(parsedMSG.code === "ENTER_GAME") {

            let playerType = currentGame.addPlayer(ws);   // Either "PLAYER 1" or "PLAYER 2"
            websockets[ws.id] = currentGame;

            if(playerType === "PLAYER 1") {
                
                var msg = messages.PLAYER_1;
                msg.data = "PLAYER 1";
                msg = JSON.stringify(msg);
                ws.send(msg);

            }

            if(playerType === "PLAYER 2") {        
                // Start new game for next players
                currentGame = new Game(serverStatistics.gamesStarted++);

                var msg = messages.PLAYER_2;
                msg.data = "PLAYER 2";
                msg = JSON.stringify(msg);
                ws.send(msg);

                websockets[ws.id].startGame();
            }

        }

        else if(parsedMSG.code === "CREATED_SECRET_COLOR") {
            websockets[ws.id].enterSecretColor(parsedMSG.data);
        }

        else if(parsedMSG.code === "COLOR_GUESS") {
            websockets[ws.id].goToState5(parsedMSG.data);
        }

        else if(parsedMSG.code === "COLOR_CHECK") {
            websockets[ws.id].checkWin(parsedMSG.data);
        }

        // Statistics
        else if (parsedMSG.code === "GET_STATISTICS") {
            var msg = messages.STATISTICS;
            msg.data = [serverStatistics.gamesStarted, serverStatistics.gamesAborted, serverStatistics.playersOnline];
            msg = JSON.stringify(msg);
            ws.send(msg);
        }

    });

    // Closing a game ==> Deals with players aborting
    ws.on("close", function(code) {
        console.log("Player: " + ws.id + " is disconnecting");

        // Stats online players
        serverStatistics.playersOnline--;

        if(inSplash) {
            return;
        }

        if(code == "1001") {    // If player is going away
            let wsObject = websockets[ws.id];

            if(wsObject.checkAborted()) {
                serverStatistics.gamesAborted++;
            }
        }

    });

}); // end of wss.on("connection")
