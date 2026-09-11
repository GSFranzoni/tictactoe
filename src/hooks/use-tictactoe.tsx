import { useEffect, useRef, useState } from "react";
import { getAiMove, type AiMode } from "@/lib/ai";
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
import { analyzeMove } from "@/lib/minimax";
import { neuralNetworkTrain } from "@/lib/training";
import type { TrainingAuditSnapshot } from "@/lib/neural-network";
import { getNeuralNetwork } from "@/lib/tictactoe-network";
export type { Board, Player } from "@/lib/game";

export type GameSettings = {
  userPlayer: Player;
  aiMode: AiMode;
};

export type Hint =
  | {
      move: number;
      mode: "dumb";
      version: number;
    }
  | {
      move: number;
      mode: "neural";
      version: number;
    }
  | {
      move: number;
      mode: "minimax";
      score: number;
      exploredStates: number;
      version: number;
    };

type Score = { X: number; O: number; draws: number };

const defaultSettings: GameSettings = { userPlayer: "X", aiMode: "minimax" };

const initialScore: Score = { X: 0, O: 0, draws: 0 };

export const useTicTacToe = () => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [board, setBoard] = useState<Board>(initialBoard);
  const [score, setScore] = useState<Score>(initialScore);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [isMoving, setIsMoving] = useState(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const [neuralNetwork] = useState(getNeuralNetwork);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingAuditSnapshot | null>(null);

  const aiTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveVersion = useRef(0);
  const hintVersion = useRef(0);

  const winner = checkWinner(board);
  const isGameOver = !winner && isBoardFull(board);

  const recordScore = (roundWinner: Winner | null) => {
    setScore((previousScore) => {
      if (!roundWinner) {
        return { ...previousScore, draws: previousScore.draws + 1 };
      }
      return {
        ...previousScore,
        [roundWinner.player]: previousScore[roundWinner.player] + 1,
      };
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

  const cancelAiTurn = () => {
    moveVersion.current += 1;
    if (aiTimeout.current) {
      clearTimeout(aiTimeout.current);
      aiTimeout.current = null;
    }
  };

  const startAiTurn = (position: Board, roundSettings: GameSettings) => {
    const aiPlayer = getOtherPlayer(roundSettings.userPlayer);
    const version = ++moveVersion.current;

    setCurrentPlayer(aiPlayer);
    setIsMoving(true);

    aiTimeout.current = setTimeout(() => {
      if (version !== moveVersion.current) {
        return;
      }

      aiTimeout.current = null;

      const move = getAiMove(position, aiPlayer, roundSettings.aiMode, neuralNetwork);

      if (move === null) {
        setIsMoving(false);
        return;
      }

      const nextBoard = makeMoveOnBoard(position, move, aiPlayer);
      setBoard(nextBoard);
      setIsMoving(false);
      setCurrentPlayer(roundSettings.userPlayer);
      finishRound(nextBoard);
    }, 1000);
  };

  const startRound = (roundSettings: GameSettings, resetScore: boolean) => {
    cancelAiTurn();
    setBoard(initialBoard);
    setHint(null);

    if (resetScore) {
      setScore(initialScore);
    }

    if (roundSettings.userPlayer === "O") {
      startAiTurn(initialBoard, roundSettings);
      return;
    }

    setCurrentPlayer("X");
    setIsMoving(false);
  };

  const play = (index: number) => {
    const userPlayer = settings.userPlayer;

    if (isMoving || currentPlayer !== userPlayer || board[index] !== "-" || winner || isGameOver) {
      return;
    }

    setHint(null);
    const nextBoard = makeMoveOnBoard(board, index, userPlayer);
    setBoard(nextBoard);

    if (finishRound(nextBoard)) {
      return;
    }

    startAiTurn(nextBoard, settings);
  };

  const requestHint = () => {
    const userPlayer = settings.userPlayer;

    if (isMoving || currentPlayer !== userPlayer || winner || isGameOver) {
      return;
    }

    if (settings.aiMode === "dumb") {
      const move = getAiMove(board, userPlayer, "dumb", neuralNetwork);

      if (move !== null) {
        setHint({ move, mode: "dumb", version: ++hintVersion.current });
      }
      return;
    }

    if (settings.aiMode === "neural") {
      const move = getAiMove(board, userPlayer, "neural", neuralNetwork);

      if (move !== null) {
        setHint({ move, mode: "neural", version: ++hintVersion.current });
      }
      return;
    }

    const analysis = analyzeMove(board, userPlayer);

    if (analysis.bestMove === null) {
      return;
    }

    setHint({
      move: analysis.bestMove,
      mode: "minimax",
      score: analysis.root.score,
      exploredStates: analysis.exploredStates,
      version: ++hintVersion.current,
    });
  };

  const resetGame = () => {
    startRound(settings, false);
  };

  const applySettings = async (nextSettings: GameSettings) => {
    if (nextSettings.aiMode === "neural") {
      setTrainingProgress(null);
      setIsTraining(true);
      await neuralNetworkTrain(neuralNetwork, 100, (_, snapshot) => {
        setTrainingProgress(snapshot);
      });
      setIsTraining(false);
    }
    setSettings(nextSettings);
    startRound(nextSettings, true);
  };

  useEffect(() => {
    return () => cancelAiTurn();
  }, []);

  return {
    settings,
    board,
    play,
    winner,
    isGameOver,
    currentPlayer,
    score,
    hint,
    requestHint,
    resetGame,
    applySettings,
    neuralNetwork,
    isMoving,
    isTraining,
    trainingProgress,
  };
};
