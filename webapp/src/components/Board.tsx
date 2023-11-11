import { useContext } from "react"
import { TEnemyContext } from "./EnemyBoard";

// Data types for props for the board component
type BoardProps = {
    // Whether or not to enable the selector for the board (used for debugging)
    enableSelector: boolean;
    // Board context to get state variables from
    context: React.Context<TEnemyContext>;
}

export function Board({ enableSelector, context }: BoardProps) {
    // Get variables from board context
    const { selected, board } = useContext(context);

    return (
        <div className="grid grid-cols-8 gap-2 p-2">
            {board.map((row, i) => {
                return (
                    row.map((_, j) => {
                        return (
                            // Render a board piece for each cell in the board
                            <BoardPiece
                                isSelected={enableSelector && i == selected.x && j == selected.y}
                                key={i * 8 + j}
                                value={board[i][j]}
                            />
                        )
                    })
                )
            })}
        </div>
    )
}

function BoardPiece({ value,isSelected }: { key: number, value: number, isSelected: boolean }) {
    // Set the background color of the board piece based on the value (-1: Not shot, 0: Miss, 1: Hit)
    const bgColor = (value === -1) ? "bg-gray-600" : (value === 0) ? "bg-red-600" : "bg-green-600";
    
    // Show a yellow border around the board piece if it is selected
    return (
        <div
            className={`
                h-14 ${bgColor}
                ${isSelected ? "border-4 border-yellow-400" : ""}
            `}
        />
    )
}