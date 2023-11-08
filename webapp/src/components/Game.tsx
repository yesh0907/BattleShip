import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";
import { Boats, Coord } from "../boats";
import EnemyBoard from "./EnemyBoard";
import Water from "./Water";
import { socket } from "../socket";
import { GameActions } from "../actions";

const NB_OF_BOATS = 3;

export type TGameContext = {
    gameStateDispatch: (action: string) => void,
    resetGame: boolean,
    selected: Coord;
    fire: boolean;
};

export const GameContext = createContext<TGameContext>({
    gameStateDispatch: () => { },
    resetGame: false,
    selected: new Coord(3, 3),
    fire: false,
});

type TGameState = {
    shotsFired: number,
    enemyBoatsLeft: number,
    resetGame: boolean,
    selected: Coord;
    fire: boolean;
}
const initialState: TGameState = {
    shotsFired: 0,
    enemyBoatsLeft: NB_OF_BOATS,
    resetGame: false,
    selected: new Coord(3, 3),
    fire: false,
}
function gameReducer(state: TGameState, action: string): TGameState {
    switch (action) {
        case "shot":
            return { ...state, shotsFired: state.shotsFired + 1, fire: false };
        case "sunk":
            return { ...state, enemyBoatsLeft: state.enemyBoatsLeft - 1 };
        case "reset":
            return { ...state, resetGame: true };
        case "finishReset":
            return initialState
        case "left":
            if (state.selected.y === 0) return { ...state, selected: new Coord(state.selected.x, 0) };
            return { ...state, selected: new Coord(state.selected.x, (state.selected.y - 1) % 8) };
        case "right":
            if (state.selected.y === 7) return { ...state, selected: new Coord(state.selected.x, 7) };
            return { ...state, selected: new Coord(state.selected.x, (state.selected.y + 1) % 8) };
        case "up":
            if (state.selected.x === 0) return { ...state, selected: new Coord(0, state.selected.y) };
            return { ...state, selected: new Coord((state.selected.x - 1) % 8, state.selected.y) };
        case "down":
            if (state.selected.x === 7) return { ...state, selected: new Coord(7, state.selected.y) };
            return { ...state, selected: new Coord((state.selected.x + 1) % 8, state.selected.y) };
        case "fire":
            return { ...state, fire: true }
        default:
            return state;
    }
}

export default function Game() {
    const enemyBoats = useMemo(() => new Boats(NB_OF_BOATS), []);
    const [{
        shotsFired,
        enemyBoatsLeft,
        resetGame,
        selected,
        fire
    }, gameStateDispatch] = useReducer(gameReducer, initialState);

    const restartGame = useCallback(() => {
        enemyBoats.reset();
        gameStateDispatch("reset");
    }, [gameStateDispatch, enemyBoats]);

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