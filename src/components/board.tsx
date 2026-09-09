import { useState } from "react";
import { Coffee, Info, Lightbulb, RotateCcw, Settings } from "lucide-react";
import { Boxes } from "@/components/background-boxes";
import { GameCell } from "@/components/game-cell";
import { GameStatus } from "@/components/game-status";
import { MinimaxExplainerDialog } from "@/components/minimax-explainer-dialog";
import { Scoreboard } from "@/components/scoreboard";
import { SettingsDialog } from "@/components/settings-dialog";
import { WinningLine } from "@/components/winning-line";
import { type Hint, useTicTacToe } from "@/hooks/use-tictactoe";
import { cn } from "@/lib/utils";

const lineCoordinates: Record<string, [number, number, number, number]> = {
  "0,1,2": [10, 16.7, 90, 16.7],
  "3,4,5": [10, 50, 90, 50],
  "6,7,8": [10, 83.3, 90, 83.3],
  "0,3,6": [16.7, 10, 16.7, 90],
  "1,4,7": [50, 10, 50, 90],
  "2,5,8": [83.3, 10, 10, 90],
  "0,4,8": [10, 10, 90, 90],
  "2,4,6": [90, 10, 10, 90],
};

const getHintContent = (hint: Hint) => {
  const square = hint.move + 1;

  if (hint.mode === "dumb") {
    return {
      title: "Dumb AI shrugs…",
      message: `Try square ${square}.`,
      detail: "Random legal square.",
    };
  }

  if (hint.score > 0) {
    return {
      title: "AI whispers…",
      message: `Winning route! Try square ${square}.`,
      detail: `${hint.exploredStates} futures checked`,
    };
  }

  if (hint.score === 0) {
    return {
      title: "AI whispers…",
      message: `Safe route! Square ${square} forces a draw.`,
      detail: `${hint.exploredStates} futures checked`,
    };
  }

  return {
    title: "AI whispers…",
    message: `Best defense: try square ${square}.`,
    detail: `${hint.exploredStates} futures checked`,
  };
};

export function Board() {
  const [isMinimaxExplainerOpen, setIsMinimaxExplainerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    settings,
    board,
    currentPlayer,
    isGameOver,
    winner,
    score,
    hint,
    play,
    requestHint,
    resetGame,
    applySettings,
    isMoving,
  } = useTicTacToe();
  const userPlayer = settings.userPlayer;

  const status = (() => {
    if (isMoving) {
      return "AI is thinking";
    }
    if (winner) {
      return winner.player === userPlayer ? "You win the toy crown!" : "AI wins the toy crown!";
    }
    if (isGameOver) {
      return "A tiny draw!";
    }
    return currentPlayer === userPlayer ? "Your turn!" : "AI is thinking";
  })();

  const winningLine = winner ? lineCoordinates[winner.combination.join(",")] : null;

  const canRequestHint =
    currentPlayer === userPlayer && !isMoving && !isGameOver && winner === null;

  const hintContent = hint ? getHintContent(hint) : null;

  return (
    <main className="relative grid min-h-screen justify-items-center items-start overflow-visible bg-canvas px-8 py-5 sm:place-items-center sm:overflow-hidden sm:px-6 sm:py-11">
      <Boxes aria-hidden="true" className="hidden opacity-35 sm:flex" />
      <section
        className="relative z-10 w-full max-w-170 bg-canvas px-0 py-0 sm:rounded-[28px] sm:border-[3px] sm:border-ink sm:bg-surface sm:px-6 sm:py-6 sm:shadow-card-lg"
        aria-label="Tic-tac-toe game"
      >
        <div className="mt-2 grid gap-4 sm:mt-4 sm:gap-5 md:grid-cols-[.86fr_1.14fr] md:items-center md:gap-7">
          <div className="space-y-4 sm:space-y-6">
            <header className="text-center sm:my-4.25">
              <p className="font-mono text-[9px] uppercase tracking-widest text-coral sm:text-[10px] sm:tracking-[.12em]">
                The world’s smallest arena
              </p>
              <h1 className="my-1 text-[clamp(30px,9vw,45px)] font-bold leading-none tracking-[-.07em] text-ink sm:my-1.5">
                Tic <span className="text-yellow">·</span> Tac{" "}
                <span className="text-yellow">·</span> Toe
              </h1>
              <p className="m-0 text-xs text-muted sm:text-sm">
                Three in a row. Big bragging rights.
              </p>
            </header>
            <Scoreboard score={score} userPlayer={userPlayer} />
            <GameStatus
              currentPlayer={currentPlayer}
              winner={winner?.player ?? null}
              message={status}
              isThinking={isMoving}
            />
          </div>
          <div className={cn("relative", isMoving && "animate-pulse")} aria-busy={isMoving}>
            <div
              className={cn(
                "relative z-10 grid grid-cols-3 gap-2 transition-opacity duration-200 sm:gap-2.5",
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
                    hint && hint.move === index && hintContent
                      ? { ...hintContent, version: hint.version }
                      : undefined
                  }
                  onPlay={play}
                />
              ))}
            </div>
            {isMoving ? (
              <div
                className="absolute inset-0 z-20 grid place-items-center rounded-[17px] border-[3px] border-dashed border-yellow bg-surface/85 backdrop-blur-[1px]"
                aria-hidden="true"
              >
                <div className="flex -rotate-2 items-center gap-2 rounded-xl border-2 border-ink bg-yellow-soft px-3 py-2 text-xs font-bold text-ink shadow-button">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  AI is thinking
                </div>
              </div>
            ) : null}
            {winningLine && winner ? (
              <WinningLine
                coordinates={winningLine}
                player={winner.player}
                label={winner.player === userPlayer ? "You" : "AI"}
              />
            ) : null}
            <div
              className="absolute -bottom-2 left-[5%] right-[5%] h-2.5 rounded-[50%] bg-shadow"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[10px] border-2 border-ink bg-yellow-soft px-3 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-yellow hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-yellow-soft disabled:hover:shadow-button sm:px-4"
            onClick={requestHint}
            disabled={!canRequestHint}
            aria-pressed={Boolean(hint)}
            aria-label={hint ? "Ask AI again" : "Ask AI"}
          >
            <Lightbulb aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{hint ? "Ask AI again" : "Ask AI"}</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[10px] border-2 border-ink bg-surface px-3 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-yellow-soft hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active sm:px-4"
            onClick={resetGame}
            aria-label="Reset the toy"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Reset the toy</span>
          </button>
          <a
            href="https://buymeacoffee.com/gsfranzoni"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[10px] border-2 border-ink bg-coral-soft px-3 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-coral hover:text-surface hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active sm:px-4"
            aria-label="Support the project on Buy Me a Coffee"
          >
            <Coffee aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Support the project</span>
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[10px] border-2 border-ink bg-surface px-3 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-yellow-soft hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active sm:px-4"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open game settings"
          >
            <Settings aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[10px] border-2 border-ink bg-teal-soft px-3 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-teal-bright hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active sm:px-4"
            onClick={() => setIsMinimaxExplainerOpen(true)}
            aria-label="Learn how Minimax works"
          >
            <Info aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {hint && hintContent
            ? `AI suggests square ${hint.move + 1}. ${hintContent.message} ${hintContent.detail}`
            : ""}
        </p>
      </section>

      {isSettingsOpen ? (
        <SettingsDialog
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(nextSettings) => {
            applySettings(nextSettings);
            setIsSettingsOpen(false);
          }}
        />
      ) : null}
      {isMinimaxExplainerOpen ? (
        <MinimaxExplainerDialog onClose={() => setIsMinimaxExplainerOpen(false)} />
      ) : null}
    </main>
  );
}
