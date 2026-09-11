import { getAvailableMoveIndexes, makeMoveOnBoard, type Board, type Player } from "@/lib/game";
import { DenseLayer, NeuralNetwork, ReLULayer, TanhLayer, type Vector } from "@/lib/neural-network";

export const getNeuralNetwork = () =>
  new NeuralNetwork([
    new DenseLayer(9, 32),
    new ReLULayer(),
    new DenseLayer(32, 32),
    new ReLULayer(),
    new DenseLayer(32, 1),
    new TanhLayer(),
  ]);

export const encodeBoard = (board: Board): Vector =>
  board.map((cell) => {
    if (cell === "X") {
      return 1;
    }
    if (cell === "O") {
      return -1;
    }
    return 0;
  });

export const getNeuralMove = (
  network: NeuralNetwork,
  board: Board,
  player: Player,
): number | null => {
  const moves = getAvailableMoveIndexes(board);

  if (moves.length === 0) {
    return null;
  }

  let bestMove = moves[0];

  let bestScore = -Infinity;

  for (const move of moves) {
    const nextBoard = makeMoveOnBoard(board, move, player);

    const input = encodeBoard(nextBoard);

    const [xValue] = network.forward(input);

    const score = player === "X" ? xValue : -xValue;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};
