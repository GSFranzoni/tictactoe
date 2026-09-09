import { useTicTacToe } from "@/hooks/use-tic-tac-toe";
import type { Player } from "@/lib/game";
import { cn } from "@/lib/utils";
import { GameCell } from "@/components/game-cell";
import { GameStatus } from "@/components/game-status";
import { PlayerMark } from "@/components/player-mark";
import { Scoreboard } from "@/components/scoreboard";
import { WinningLine } from "@/components/winning-line";
import { Boxes } from "@/components/background-boxes";
import { playClick } from "@/lib/sound";

const playerNames = { X: "Player X", O: "Player O" } as const;

const getHintMessage = (score: number, square: number) => {
  if (score > 0) {
    return `Winning route! Try square ${square}.`;
  }
  if (score === 0) {
    return `Safe route! Square ${square} forces a draw.`;
  }
  return `Best defense: try square ${square}.`;
};

const lineCoordinates: Record<string, [number, number, number, number]> = {
  "0,1,2": [10, 16.7, 90, 16.7],
  "3,4,5": [10, 50, 90, 50],
  "6,7,8": [10, 83.3, 90, 83.3],
  "0,3,6": [16.7, 10, 16.7, 90],
  "1,4,7": [50, 10, 50, 90],
  "2,5,8": [83.3, 10, 83.3, 90],
  "0,4,8": [10, 10, 90, 90],
  "2,4,6": [90, 10, 10, 90],
};

export function Board() {
  const userPlayer: Player = "X";

  const {
    board,
    currentPlayer,
    isGameOver,
    winner,
    score,
    hint,
    play,
    requestHint,
    resetGame,
    isMoving,
  } = useTicTacToe({ userPlayer });

  const status = (() => {
    if (isMoving && currentPlayer !== userPlayer) {
      return `${playerNames[currentPlayer]} is thinking`;
    }
    if (winner) {
      return `${playerNames[winner.player]} wins the toy crown!`;
    }
    if (isGameOver) {
      return "A tiny draw!";
    }
    if (currentPlayer) {
      return `${playerNames[currentPlayer]} is on the move`;
    }
  })();

  const winningLine = winner ? lineCoordinates[winner.combination.join(",")] : null;

  const canRequestHint =
    currentPlayer === userPlayer && !isMoving && !isGameOver && winner === null;

  const hintMessage = hint ? getHintMessage(hint.score, hint.move + 1) : null;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-3.5 py-6 sm:px-5 sm:py-11">
      <Boxes aria-hidden="true" className="opacity-35" />
      <section
        className="relative z-10 w-full max-w-170 rounded-[28px] border-[3px] border-ink bg-surface px-4 py-5 shadow-card sm:px-6 sm:py-6 sm:shadow-card-lg"
        aria-label="Tic-tac-toe game"
      >
        <div className="mt-4 grid gap-5 md:grid-cols-[.86fr_1.14fr] md:items-center md:gap-7">
          <div className="space-y-6">
            <header className="text-center sm:my-4.25">
              <img
                src={`${import.meta.env.BASE_URL}logos/logo.svg`}
                alt=""
                aria-hidden="true"
                className="mx-auto mb-3 h-14 w-14"
              />
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-coral">
                The world’s smallest arena
              </p>
              <h1 className="my-1.5 text-[clamp(34px,9vw,45px)] font-bold leading-none tracking-[-.07em] text-ink">
                Tic <span className="text-yellow">·</span> Tac{" "}
                <span className="text-yellow">·</span> Toe
              </h1>
              <p className="m-0 text-sm text-muted">Three in a row. Big bragging rights.</p>
            </header>
            <Scoreboard score={score} />
            <GameStatus
              currentPlayer={currentPlayer}
              winner={winner?.player ?? null}
              message={status ?? ""}
              isThinking={isMoving}
            />
          </div>
          <div className={cn("relative", isMoving && "animate-pulse")} aria-busy={isMoving}>
            <div
              className={cn(
                "relative z-10 grid grid-cols-3 gap-2.5 transition-opacity duration-200",
                isMoving && "opacity-70",
              )}
              role="grid"
              aria-label="Tic-tac-toe board"
            >
              {board.map((cell, index) => (
                <GameCell
                  key={index}
                  cell={cell}
                  index={index}
                  isGameOver={isGameOver || isMoving}
                  isDisabled={currentPlayer !== userPlayer}
                  hint={
                    hint && hint.move === index && hintMessage
                      ? {
                          message: hintMessage,
                          exploredStates: hint.exploredStates,
                          version: hint.version,
                        }
                      : undefined
                  }
                  onPlay={(index) => {
                    playClick();
                    play(index);
                  }}
                />
              ))}
            </div>
            {isMoving && (
              <div
                className="absolute inset-0 z-20 grid place-items-center rounded-[17px] border-[3px] border-dashed border-yellow bg-surface/85 backdrop-blur-[1px]"
                aria-hidden="true"
              >
                <div className="flex -rotate-2 items-center gap-2 rounded-xl border-2 border-ink bg-yellow-soft px-3 py-2 text-xs font-bold text-ink shadow-button">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  Player O is thinking
                </div>
              </div>
            )}
            {winningLine && winner && (
              <WinningLine coordinates={winningLine} player={winner.player} />
            )}
            <div
              className="absolute -bottom-2 left-[5%] right-[5%] h-2.5 rounded-[50%] bg-shadow"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3" aria-label="Players">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <b className="grid h-6.5 w-6.5 place-items-center rounded-lg border-2 border-ink bg-coral-soft text-coral">
              <PlayerMark player="X" small />
            </b>
            <span>Player X</span>
          </div>
          <span className="font-mono text-[10px] tracking-[.12em] text-muted-soft">VS</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <b className="grid h-6.5 w-6.5 place-items-center rounded-lg border-2 border-ink bg-teal-soft text-teal">
              <PlayerMark player="O" small />
            </b>
            <span>Player O</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            className="inline-flex items-center gap-1.5 rounded-[10px] border-2 border-ink bg-yellow-soft px-4 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-yellow hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-yellow-soft disabled:hover:shadow-button"
            onClick={requestHint}
            disabled={!canRequestHint}
            aria-pressed={Boolean(hint)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.7 18.4h4.6M10 21h4m-6.5-7.2A6 6 0 1 1 16.5 14c-.9.8-1.5 1.5-1.7 2.4H9.2c-.2-.9-.8-1.6-1.7-2.4Z"
              />
            </svg>
            {hint ? "Hint again" : "Ask Minimax"}
          </button>
          <button
            className="rounded-[10px] border-2 border-ink bg-surface px-4 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-yellow-soft hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active"
            onClick={resetGame}
          >
            <span aria-hidden="true">↻</span> Reset the toy
          </button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {hint && hintMessage
            ? `Minimax suggests square ${hint.move + 1}. ${hintMessage} ${hint.exploredStates} futures checked.`
            : ""}
        </p>
      </section>
    </main>
  );
}
