import { useEffect, useRef, useState } from "react";
import {
  checkWinner,
  getOtherPlayer,
  initialBoard,
  isBoardFull,
  makeMoveOnBoard,
  type Board,
  type Player,
  type Winner,
} from "@/lib/game";
import { analyzeMove, getBestMove } from "@/lib/minimax";
export type { Board, Player } from "@/lib/game";

type Props = {
  userPlayer: Player;
};

export type Hint = {
  move: number;
  score: number;
  exploredStates: number;
  version: number;
};

export const useTicTacToe = ({ userPlayer }: Props) => {
  const [board, setBoard] = useState<Board>(initialBoard);

  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });

  const [currentPlayer, setCurrentPlayer] = useState<Player>(userPlayer);

  const [isMoving, setIsMoving] = useState(false);

  const [hint, setHint] = useState<Hint | null>(null);

  const aiPlayer = getOtherPlayer(userPlayer);

  const aiTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const moveVersion = useRef(0);

  const hintVersion = useRef(0);

  const winner = checkWinner(board);

  const isGameOver = !winner && isBoardFull(board);

  const recordScore = (winner: Winner | null) => {
    setScore((prevScore) => {
      if (!winner) {
        return { ...prevScore, draws: prevScore.draws + 1 };
      }
      return { ...prevScore, [winner.player]: prevScore[winner.player] + 1 };
    });
  };

  const finishRound = (nextBoard: Board) => {
    const nextWinner = checkWinner(nextBoard);

    if (nextWinner || isBoardFull(nextBoard)) {
      recordScore(nextWinner);
      return true;
    }

    return false;
  };

  const play = (index: number) => {
    if (isMoving || currentPlayer !== userPlayer || board[index] !== "-" || winner || isGameOver) {
      return;
    }

    setHint(null);

    const userTurnBoard = makeMoveOnBoard(board, index, userPlayer);

    setBoard(userTurnBoard);

    if (finishRound(userTurnBoard)) {
      return;
    }

    setCurrentPlayer(aiPlayer);
    setIsMoving(true);

    const version = ++moveVersion.current;

    aiTimeout.current = setTimeout(() => {
      if (version !== moveVersion.current) {
        return;
      }

      const bestMove = getBestMove(userTurnBoard, aiPlayer);

      if (bestMove === null) {
        setIsMoving(false);
        return;
      }

      const aiTurnBoard = makeMoveOnBoard(userTurnBoard, bestMove, aiPlayer);
      setBoard(aiTurnBoard);
      setIsMoving(false);
      setCurrentPlayer(userPlayer);

      if (finishRound(aiTurnBoard)) {
        return;
      }
    }, 1000);
  };

  const requestHint = () => {
    if (isMoving || currentPlayer !== userPlayer || winner || isGameOver) {
      return;
    }

    const analysis = analyzeMove(board, userPlayer);

    if (analysis.bestMove === null) {
      return;
    }

    setHint({
      move: analysis.bestMove,
      score: analysis.root.score,
      exploredStates: analysis.exploredStates,
      version: ++hintVersion.current,
    });
  };

  const resetGame = () => {
    moveVersion.current += 1;
    if (aiTimeout.current) {
      clearTimeout(aiTimeout.current);
      aiTimeout.current = null;
    }
    setBoard(initialBoard);
    setCurrentPlayer(userPlayer);
    setIsMoving(false);
    setHint(null);
  };

  useEffect(() => {
    return () => {
      if (aiTimeout.current) {
        clearTimeout(aiTimeout.current);
      }
    };
  }, []);

  return {
    board,
    play,
    winner,
    isGameOver,
    currentPlayer,
    score,
    hint,
    requestHint,
    resetGame,
    isMoving,
  };
};
