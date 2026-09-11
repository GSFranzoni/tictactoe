import {
  checkWinner,
  getAvailableMoveIndexes,
  getOtherPlayer,
  initialBoard,
  isBoardFull,
  makeMoveOnBoard,
  type Board,
  type Player,
} from "@/lib/game";
import { analyzeMove } from "@/lib/minimax";
import {
  MeanSquaredLoss,
  SGD,
  TrainingAudit,
  type NeuralNetwork,
  type TrainingAuditSnapshot,
} from "@/lib/neural-network";
import { encodeBoard } from "@/lib/tictactoe-network";
import { shuffle, yieldToBrowser } from "@/lib/utils";

type TrainingSample = {
  input: number[];
  label: number;
};

const getLabel = (player: Player, score: number) => {
  const xScore = player === "X" ? score : -score;
  if (xScore > 0) {
    return 1;
  }
  if (xScore < 0) {
    return -1;
  }
  return 0;
};

const generateDataset = (): TrainingSample[] => {
  const samples: TrainingSample[] = [];

  const visited = new Set<string>();

  const visit = (board: Board, player: Player) => {
    const key = board.join("");

    if (visited.has(key)) {
      return;
    }

    visited.add(key);

    const { root } = analyzeMove(board, player);

    samples.push({ input: encodeBoard(board), label: getLabel(player, root.score) });

    if (checkWinner(board) || isBoardFull(board)) {
      return;
    }

    for (const move of getAvailableMoveIndexes(board)) {
      visit(makeMoveOnBoard(board, move, player), getOtherPlayer(player));
    }
  };

  visit(initialBoard, "X");

  return samples;
};

const samples = generateDataset();

export async function neuralNetworkTrain(
  network: NeuralNetwork,
  epochs = 10,
  onReport?: (epoch: number, snapshot: TrainingAuditSnapshot) => unknown,
) {
  await yieldToBrowser();

  const optimizer = new SGD(0.01);

  const lossFunction = new MeanSquaredLoss();

  for (let epoch = 0; epoch < epochs; epoch++) {
    const audit = new TrainingAudit();

    for (const sample of shuffle(samples)) {
      const prediction = network.forward(sample.input);
      const { loss, gradient } = lossFunction.calculate(prediction, sample.label);
      network.backward(gradient);
      optimizer.step(network.parameters());
      audit.record(prediction, sample.label, loss);
    }

    onReport?.(epoch + 1, audit.snapshot());
    await yieldToBrowser();
  }
}
