import { getAvailableMoveIndexes, type Board, type Player } from "@/lib/game";
import { getBestMove } from "@/lib/minimax";

export type AiMode = "dumb" | "minimax";

export const getAiMove = (board: Board, player: Player, mode: AiMode): number | null => {
  if (mode === "minimax") {
    return getBestMove(board, player);
  }

  const moves = getAvailableMoveIndexes(board);

  if (moves.length === 0) {
    return null;
  }

  return moves[Math.floor(Math.random() * moves.length)];
};
