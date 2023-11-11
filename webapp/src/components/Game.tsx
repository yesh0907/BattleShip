import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";
import { Boats, Coord } from "../boats";
import EnemyBoard from "./EnemyBoard";
import Water from "./Water";
import { socket } from "../socket";
import { GameActions } from "../actions";

// Default number of boats to spawn
const NB_OF_BOATS = 3;

// Data types for context for the game state (exposed to child components)
export type TGameContext = {
    gameStateDispatch: (action: string) => void,
    resetGame: boolean,
    selected: Coord;
    fire: boolean;
};

// Default values for the game state context (exposed to child components)
export const GameContext = createContext<TGameContext>({
    gameStateDispatch: () => { },
    resetGame: false,
    selected: new Coord(3, 3),
    fire: false,
});

// Data types for the game state
type TGameState = {
    shotsFired: number,
    enemyBoatsLeft: number,
    resetGame: boolean,
    selected: Coord;
    fire: boolean;
}
// Initial state for the game state
const initialState: TGameState = {
    shotsFired: 0,
    enemyBoatsLeft: NB_OF_BOATS,
    resetGame: false,
    selected: new Coord(3, 3),
    fire: false,
}

// Reducer used to generate new game state based on the action dispatched
function gameReducer(state: TGameState, action: string): TGameState {
    switch (action) {
        case "shot":
            // Shot has been processed by the game, increment the number of shots fired
            return { ...state, shotsFired: state.shotsFired + 1, fire: false };
        case "sunk":
            return { ...state, enemyBoatsLeft: state.enemyBoatsLeft - 1 };
        case "reset":
            // Update state to trigger the reset of the game UI
            return { ...state, resetGame: true };
        case "finishReset":
            // Reset the game state after the game UI reset actions have finished
            return initialState
        case "left":
            // If the selected boat is on the left edge of the board, do nothing
            if (state.selected.y === 0) return { ...state, selected: new Coord(state.selected.x, 0) };
            return { ...state, selected: new Coord(state.selected.x, (state.selected.y - 1) % 8) };
        case "right":
            // If the selected boat is on the right edge of the board, do nothing
            if (state.selected.y === 7) return { ...state, selected: new Coord(state.selected.x, 7) };
            return { ...state, selected: new Coord(state.selected.x, (state.selected.y + 1) % 8) };
        case "up":
            // If the selected boat is on the top edge of the board, do nothing
            if (state.selected.x === 0) return { ...state, selected: new Coord(0, state.selected.y) };
            return { ...state, selected: new Coord((state.selected.x - 1) % 8, state.selected.y) };
        case "down":
            // If the selected boat is on the bottom edge of the board, do nothing
            if (state.selected.x === 7) return { ...state, selected: new Coord(7, state.selected.y) };
            return { ...state, selected: new Coord((state.selected.x + 1) % 8, state.selected.y) };
        case "fire":
            // State to keep track of whether the player has fired a shot so child components can update accordingly
            return { ...state, fire: true }
        default:
            return state;
    }
}

export default function Game() {
    // Create a Boats object to keep track of the enemy boats and memoize it so it doesn't get recreated on every render
    const enemyBoats = useMemo(() => new Boats(NB_OF_BOATS), []);
    // Create a reducer to keep track of the game state
    const [{
        shotsFired,
        enemyBoatsLeft,
        resetGame,
        selected,
        fire
    }, gameStateDispatch] = useReducer(gameReducer, initialState);

    // Memoize restart game function so it doesn't get recreated on every render
    const restartGame = useCallback(() => {
        enemyBoats.reset();
        gameStateDispatch("reset");
    }, [gameStateDispatch, enemyBoats]);

    // Listen & process game actions from the server via the WebSocket
    useEffect(() => {
        socket.on(GameActions.LEFT.toString(), () => {
            gameStateDispatch("left");
        });

        socket.on(GameActions.RIGHT.toString(), () => {
            gameStateDispatch("right");
        });

        socket.on(GameActions.UP.toString(), () => {
            gameStateDispatch("up");
        });

        socket.on(GameActions.DOWN.toString(), () => {
            gameStateDispatch("down");
        });

        socket.on(GameActions.FIRE.toString(), () => {
            gameStateDispatch("fire");
        });

        socket.on(GameActions.RESET_GAME.toString(), () => {
            restartGame();
        });

        // Remove event listeners when component unmounts
        return () => {
            socket.off(GameActions.LEFT.toString());
            socket.off(GameActions.RIGHT.toString());
            socket.off(GameActions.UP.toString());
            socket.off(GameActions.DOWN.toString());
            socket.off(GameActions.FIRE.toString());
            socket.off(GameActions.RESET_GAME.toString());
        }
    }, [restartGame]);

    return (
        <GameContext.Provider value={{ gameStateDispatch, resetGame, selected, fire }}>
            <div className="flex flex-col w-3/5 h-full mt-1">
                {
                    (enemyBoatsLeft === 0) &&
                    <h3 className="text-2xl text-emerald-500 font-bold self-center">Player Won!</h3>
                }
                <div className="flex items-center justify-between">
                    <h3 className="text-lg text-indigo-500 font-medium">Boats Left: {enemyBoatsLeft}</h3>

                    <h3
                        className="text-lg text-sky-500 font-bold hover:cursor-pointer hover:text-sky-700"
                        onClick={() => restartGame()}>
                        Restart Game?
                    </h3>
                    <h3 className="text-lg text-orange-500 font-medium">Shots Fired: {shotsFired}</h3>
                </div>
                <div className="flex flex-col h-full border-2 border-blue-700 bg-white">
                    <EnemyBoard enemy={enemyBoats} />
                    <Water />
                </div>
            </div>
        </GameContext.Provider>
    )
}