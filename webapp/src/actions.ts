/**
 * IMPORTANT: THIS FILE MUST BE KEPT IN SYNC WITH THE FILE IN THE SERVER
 */
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