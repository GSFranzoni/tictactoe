import { checkWinner, getOtherPlayer, type Board, type Player } from "@/lib/game";
import { analyzeMove, type SearchNode } from "@/lib/minimax";

export type VisibleResponse = {
  node: SearchNode;
  terminal: SearchNode;
  decisive: boolean;
};

export type VisibleCandidate = {
  node: SearchNode;
  responses: VisibleResponse[];
  minimizer: SearchNode;
  selected: boolean;
};

export type VisualMinimaxTrace = {
  root: SearchNode;
  candidates: VisibleCandidate[];
  bestMove: number;
  exploredStates: number;
};

// The game engine keeps depth-weighted scores to prefer a faster win (and a
// later loss). The video teaches the three Minimax outcomes, so it presents
// those scores as the conventional -1 / 0 / +1 values.
export const visualScore = (score: number) => Math.sign(score);

const terminalDescendant = (node: SearchNode): SearchNode => {
  if (node.children.length === 0) {
    return node;
  }
  const next = node.children.find((child) => child.score === node.score);
  return terminalDescendant(next ?? node.children[0]);
};

const selectResponses = (candidate: SearchNode): VisibleResponse[] => {
  const minimizer = candidate.children.find((child) => child.score === candidate.score);
  if (!minimizer) {
    throw new Error("Candidate has no MIN-determining response.");
  }

  const contrast = candidate.children.find(
    (child) => child !== minimizer && child.score !== minimizer.score,
  );
  const fallback = candidate.children.find((child) => child !== minimizer);

  return [minimizer, contrast ?? fallback]
    .filter((node): node is SearchNode => Boolean(node))
    .map((node) => ({
      node,
      terminal: terminalDescendant(node),
      decisive: node === minimizer,
    }));
};

export const createVisualMinimaxTrace = (
  board: Board,
  player: Player = "O",
): VisualMinimaxTrace => {
  const search = analyzeMove(board, player);
  if (search.bestMove === null) {
    throw new Error("This board has no legal move.");
  }

  const selected = search.root.children.find((child) => child.move === search.bestMove);
  if (!selected) {
    throw new Error("The selected move is missing from the full trace.");
  }

  const uniqueScores = [-1, 0, 1]
    .map((score) => search.root.children.find((child) => visualScore(child.score) === score))
    .filter((child): child is SearchNode => Boolean(child));
  const visibleNodes = [...uniqueScores];

  if (!visibleNodes.includes(selected)) {
    // When several moves share an outcome, show the engine's actual choice
    // rather than an arbitrary representative of that outcome.
    const equivalentOutcome = visibleNodes.findIndex(
      (node) => visualScore(node.score) === visualScore(selected.score),
    );
    if (equivalentOutcome >= 0) {
      visibleNodes[equivalentOutcome] = selected;
    } else {
      visibleNodes.push(selected);
    }
  }
  for (const child of search.root.children) {
    if (visibleNodes.length >= 3) {
      break;
    }
    if (!visibleNodes.includes(child)) {
      visibleNodes.push(child);
    }
  }

  return {
    root: search.root,
    candidates: visibleNodes
      .slice(0, 3)
      .sort((left, right) => visualScore(left.score) - visualScore(right.score))
      .map((node) => ({
        node,
        responses: selectResponses(node),
        minimizer: node.children.find((child) => child.score === node.score)!,
        selected: node.move === search.bestMove,
      })),
    bestMove: search.bestMove,
    exploredStates: search.exploredStates,
  };
};

export const outcomeLabel = (node: SearchNode) => {
  const winner = checkWinner(node.board)?.player;
  if (winner === "O") {
    return "PLAYER O WINS";
  }
  if (winner === "X") {
    return "PLAYER X WINS";
  }
  return "DRAW";
};

export const scoreText = (score: number) => {
  const normalized = visualScore(score);
  return normalized > 0 ? `+${normalized}` : String(normalized);
};

export const nextPlayerLabel = (player: Player) =>
  player === "X" ? "PLAYER X · MIN" : "PLAYER O · MAX";

export const responsePlayer = (candidate: SearchNode) => getOtherPlayer(candidate.player);
