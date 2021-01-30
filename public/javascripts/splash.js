
// General stuff for splash screen
document.getElementById('howToPlay').addEventListener('click', function(){
    document.getElementById('info-bg-close').style.top = '0';
    document.getElementById('info-bg-close').style.background = 'rgba(0,0,0,.6)'
});

document.getElementById('infoClose').addEventListener('click', closeInfo);
document.getElementById('info-bg-close').addEventListener('click', closeInfo);

function closeInfo(){
    document.getElementById('info-bg-close').style.top = '-300%';
    document.getElementById('info-bg-close').style.background = 'transparent'
}

function gamerules() {
    if(bool) {
        document.getElementById('howToPlay').style.background = 'blue';
        bool = false;
    }
    else {
        document.getElementById('howToPlay').style.background = 'green';
        bool = true;
    }
}

/**======================================== 
 * Connection with server for splash screen
 * ========================================
 */
(function setup() { 
    
    const socket = new WebSocket("ws:24.132.126.223:25565/splash"); // could also be localhost:3000
    let messages = {};

    let statisticsInterval = setInterval(function() {

        var msg = messages.GET_STATISTICS;
        msg = JSON.stringify(msg);
        socket.send(msg);
    }, 10 * 1000);


    socket.onmessage = function(event) {
        let receivedMsg = JSON.parse(event.data);


        if (receivedMsg.code === "MESSAGES") {
            console.log("MESSAGE pack received.");
            // Set the variable of messages to messages pack from server
            messages = receivedMsg.data;

            // Report back to server
            var msg = messages.ENTER_SPLASH;
            msg = JSON.stringify(msg);
            socket.send(msg);

        }

        else if (receivedMsg.code === "STATISTICS") {
            console.log("Statistics received.");
            document.getElementById('currentGames').querySelector('span').innerHTML = receivedMsg.data[0];
            document.getElementById('gamesAborted').querySelector('span').innerHTML = receivedMsg.data[1];
            document.getElementById('onlinePlayers').querySelector('span').innerHTML = receivedMsg.data[2];

        }
    }

})();