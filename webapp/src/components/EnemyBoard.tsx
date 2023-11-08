import { Board } from "./Board";
import { Boats, Coord } from "../boats";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { GameContext } from "./Game";
import { sendEventToServer } from "../socket";
import { GameStateEvents } from "../actions";

export type TEnemyContext = {
    board: number[][];
    selected: Coord;
}
export const EnemyContext = createContext<TEnemyContext>({
    board: Array<number[]>(8).fill(Array<number>(8).fill(-1)),
    selected: new Coord(3, 3),
});

export default function EnemyBoard({ enemy }: { enemy: Boats }) {
    const { gameStateDispatch, resetGame, selected, fire } = useContext(GameContext);
    const [board, setBoard] = useState(Array<number[]>(8).fill(Array<number>(8).fill(-1)));

    const updateBoard = useCallback((row: number, col: number) => {
        if (board[row][col] !== -1) return;
        const boatsLeft = enemy.boatsLeft();
        gameStateDispatch("shot");

        const newBoard = board.map((r, i) => {
            return r.map((c, j) => {
                if (i === row && j === col) {
                    return enemy.updateHit(new Coord(row, col)) ? 1 : 0;
                }
                return c;
            });
        });
        setBoard(newBoard);
        const newBoatsLeft = enemy.boatsLeft();
        if (boatsLeft.length !== newBoatsLeft.length) {
            gameStateDispatch("sunk");
            if (newBoatsLeft.length === 0) {
                sendEventToServer(GameStateEvents.WIN);
            } else {
                sendEventToServer(GameStateEvents.SUNK);
            }
        }
    }, [board, enemy, gameStateDispatch]);

    useEffect(() => {
        if (resetGame) {
            setBoard(Array<number[]>(8).fill(Array<number>(8).fill(-1)));
            gameStateDispatch("finishReset");
        }
    }, [resetGame, setBoard, gameStateDispatch]);

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