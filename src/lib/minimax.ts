import {
  checkWinner,
  getAvailableMoveIndexes,
  getOtherPlayer,
  isBoardFull,
  makeMoveOnBoard,
  type Board,
  type Player,
} from "@/lib/game";

export type SearchNode = {
  board: Board;
  player: Player;
  score: number;
  move: number | null;
  children: SearchNode[];
};

const winScore = 10;

export function analyzeMove(board: Board, player: Player) {
  const cache = new Map<string, SearchNode>();

  const visits: string[] = [];

  function visit(position: Board, turn: Player, depth: number): SearchNode {
    const key = position.join("") + turn;

    const cached = cache.get(key);

    if (cached) {
      return cached;
    }

    visits.push(key);

    const winner = checkWinner(position);

    const node: SearchNode = {
      board: position,
      player: turn,
      score: winner ? (winner.player === player ? winScore - depth : depth - winScore) : 0,
      move: null,
      children: [],
    };

    cache.set(key, node);

    if (winner || isBoardFull(position)) {
      return node;
    }

    node.children = getAvailableMoveIndexes(position).map((move) => ({
      ...visit(makeMoveOnBoard(position, move, turn), getOtherPlayer(turn), depth + 1),
      move,
    }));

    node.score = (turn === player ? Math.max : Math.min)(
      ...node.children.map((child) => child.score),
    );

    return node;
  }

  const root = visit(board, player, 0);

  const bestMove = root.children.find((child) => child.score === root.score)?.move ?? null;

  return {
    root,
    bestMove,
    exploredStates: visits.length,
    visits,
  };
}
export const getBestMove = (board: Board, player: Player): number | null =>
  analyzeMove(board, player).bestMove;
