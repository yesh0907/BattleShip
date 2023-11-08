/***
 * IMPORTANT: THIS FILE MUST BE KEPT IN SYNC WITH THE FILE IN THE ARDUINO SKETCH AND WEBAPP
 */

// Actions sent from the ardunio to the server
export enum ArduinoActions {
    READY,
    LEFT,
    RIGHT,
    UP,
    DOWN,
    FIRE,
    RESET_GAME,
    UNKNOWN_ACTION_RECEVIED,
}

// Actions sent from the server to the arduino
export enum ServerActions {
    CONNECTED,
    READY_FOR_GAME,
    SUNK,
    WIN,
}

// Actions sent from the server to the webapp
export enum GameActions {
    LEFT,
    RIGHT,
    UP,
    DOWN,
    FIRE,
    RESET_GAME,
}

// Events sent from the webapp to the server about the game state
export enum GameStateEvents {
    SUNK,
    WIN,
}