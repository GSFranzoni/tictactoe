import { getAvailableMoveIndexes, type Board, type Player } from "@/lib/game";
import { getBestMove } from "@/lib/minimax";
import { NeuralNetwork } from "@/lib/neural-network";
import { getNeuralMove } from "@/lib/tictactoe-network";

export type AiMode = "dumb" | "minimax" | "neural";

export const getAiMove = (
  board: Board,
  player: Player,
  mode: AiMode,
  network: NeuralNetwork,
): number | null => {
  if (mode === "minimax") {
    return getBestMove(board, player);
  }

  if (mode === "neural") {
    return getNeuralMove(network, board, player);
  }

  const moves = getAvailableMoveIndexes(board);

  if (moves.length === 0) {
    return null;
  }

  return moves[Math.floor(Math.random() * moves.length)];
};
