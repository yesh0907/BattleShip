import { useContext } from "react"
import { TEnemyContext } from "./EnemyBoard";

type BoardProps = {
    enableSelector: boolean;
    context: React.Context<TEnemyContext>;
}

export function Board({ enableSelector, context }: BoardProps) {
    const { selected, board } = useContext(context);

    return (
        <div className="grid grid-cols-8 gap-2 p-2">
            {board.map((row, i) => {
                return (
                    row.map((_, j) => {
                        return (
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
    const bgColor = (value === -1) ? "bg-gray-600" : (value === 0) ? "bg-red-600" : "bg-green-600";
    return (
        <div
            className={`
                h-14 ${bgColor}
                ${isSelected ? "border-4 border-yellow-400" : ""}
            `}
        />
    )
}