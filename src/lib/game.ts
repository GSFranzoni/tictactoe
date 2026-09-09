export type Player = "X" | "O";

export type Cell = Player | "-";

export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type Winner = { player: Player; combination: number[] };

export const initialBoard: Board = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const checkWinner = (board: Board): Winner | null => {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] !== "-" && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], combination };
    }
  }
  return null;
};

export const isBoardFull = (board: Board) => !board.includes("-");

export const getOtherPlayer = (player: Player): Player => (player === "X" ? "O" : "X");

export const makeMoveOnBoard = (board: Board, index: number, player: Player): Board => {
  const nextBoard = [...board] as Board;
  nextBoard[index] = player;
  return nextBoard;
};

export const getAvailableMoveIndexes = (board: Board) =>
  board.reduce<number[]>((moves, cell, index) => {
    if (cell === "-") {
      moves.push(index);
    }
    return moves;
  }, []);
