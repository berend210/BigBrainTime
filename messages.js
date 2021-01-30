const messages = {
    // PLAYER_CONNECTED: { code: "PLAYER_CONNECTED", message: "User connected", data: null }, // either in game or splash screen
    ABORTED: { code: "OPPONENT_DISCONNECTED", message: "Your opponent disconnected or lost connection. The game ended.", data: null },
    PLAYER_1: { code: "PLAYER_1", message: "You are player 1", data: null},
    PLAYER_2: { code: "PLAYER_2", message: "You are player 2", data: null},
    MAKE_SECRET_COLOR: { code: "MAKE_SECRET_COLOR", message: "The game has begun. Make a secret color code!", data: null},
    WAITING_FOR_SECRET: { code: "WAITING_FOR_SECRET", message: "Waiting for opponent to choose 4 colors", data: null},
    PLAYER_2_GUESSING: { code: "PLAYER_2_GUESSING", message: "Make a guess!", data: null},
    PLAYER_1_WAITING: { code: "PLAYER_1_WAITING", message: "Waiting for player 2 to make a guess.", data: null},
    PLAYER_1_CORRECTING: { code: "PLAYER_1_CORRECTING", message: "Correct the guess from player 2", data: null},
    PLAYER_2_WAITING: { code: "PLAYER_2_WAITING", message: "Wait for player 1 to correct your guess", data: null},

    PLAYER_1_WINS: { code: "PLAYER_1_WINS", message: "You won!", data: null},
    PLAYER_2_WINS: { code: "PLAYER_2_WINS", message: "You won!", data: null},

    PLAYER_1_LOSES: { code: "PLAYER_1_LOSES", message: "Your opponent cracked the code.. <a href\"/splash\">Better luck next time!</a>", data: null},
    PLAYER_2_LOSES: { code: "PLAYER_2_LOSES", message: "The code was too strong, <a href=\"/splash\">better luck in the next round?</a>", data: null},
    
    STATISTICS: { code: "STATISTICS", message: "Current stats", data: null}
    
}


const clientMessages = {
    CREATED_SECRET_COLOR: { code: "CREATED_SECRET_COLOR", message: "Player 1 created color", data: null},
    COLOR_GUESS: { code: "COLOR_GUESS", message: "Player 2 made a guess", data: null},
    COLOR_CHECK: { code: "COLOR_CHECK", message: "Player 1 corrected the guess", data: null},
    ENTER_SPLASH: { code: "ENTER_SPLASH", message: "Player entered splash screen", data: null},
    ENTER_GAME: { code: "ENTER_GAME", message: "Player entered game screen", data: null},
    GET_STATISTICS: { code: "GET_STATISTICS", message: "Gimme stats", data: null }
}


exports.messages = messages;
exports.clientMessages = clientMessages;