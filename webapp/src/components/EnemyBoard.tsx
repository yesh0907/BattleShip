import { Board } from "./Board";
import { Boats, Coord } from "../boats";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { GameContext } from "./Game";
import { sendEventToServer } from "../socket";
import { GameStateEvents } from "../actions";

// Data types for context for the enemy board (exposed to child components)
export type TEnemyContext = {
    board: number[][];
    selected: Coord;
}
// Default values for the enemy board context (exposed to child components)
export const EnemyContext = createContext<TEnemyContext>({
    board: Array<number[]>(8).fill(Array<number>(8).fill(-1)),
    selected: new Coord(3, 3),
});

// Get Enemy Boats from props
export default function EnemyBoard({ enemy }: { enemy: Boats }) {
    // Get game state variables & functions from context
    const { gameStateDispatch, resetGame, selected, fire } = useContext(GameContext);
    // State to keep track of the enemy board
    const [board, setBoard] = useState(Array<number[]>(8).fill(Array<number>(8).fill(-1)));

    // Memoized function to update the enemy board when a shot is fired and update the game state
    const updateBoard = useCallback((row: number, col: number) => {
        // Do nothing if the selected cell has already been shot
        if (board[row][col] !== -1) return;
        // Get current boats left on the board
        const boatsLeft = enemy.boatsLeft();
        // Dispatch to game state that shot has been processed by the game
        gameStateDispatch("shot");

        const newBoard = board.map((r, i) => {
            return r.map((c, j) => {
                if (i === row && j === col) {
                    // Update the board with the result of the shot
                    return enemy.updateHit(new Coord(row, col)) ? 1 : 0;
                }
                return c;
            });
        });
        // Update the enemy board with the new board
        setBoard(newBoard);

        // Get new boats left on the board
        const newBoatsLeft = enemy.boatsLeft();
        if (boatsLeft.length !== newBoatsLeft.length) {
            // If the number of boats left has decreased, dispatch to game state that a boat has been sunk
            gameStateDispatch("sunk");

            // If there are no boats left, tell the server that the player has won,
            // otherwise tell the server that a boat has been sunk
            if (newBoatsLeft.length === 0) {
                sendEventToServer(GameStateEvents.WIN);
            } else {
                sendEventToServer(GameStateEvents.SUNK);
            }
        }
    }, [board, enemy, gameStateDispatch]);

    // Reset the enemy board when the game state resetGame variable is set to true
    useEffect(() => {
        if (resetGame) {
            setBoard(Array<number[]>(8).fill(Array<number>(8).fill(-1)));
            gameStateDispatch("finishReset");
        }
    }, [resetGame, setBoard, gameStateDispatch]);

    // Update the enemy board when the game state fire variable is set to true
    useEffect(() => {
        if (fire) {
            updateBoard(selected.x, selected.y);
        }
    }, [fire, updateBoard, selected]);

    return (
        <EnemyContext.Provider value={{ selected, board }}>
            <Board context={EnemyContext} enableSelector />
        </EnemyContext.Provider>
    )
}