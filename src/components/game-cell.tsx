import { PlayerMark } from "@/components/player-mark";
import { cn } from "@/lib/utils";

type Cell = "X" | "O" | "-";

type Hint = {
  title: string;
  message: string;
  detail?: string;
  version: number;
};

type GameCellProps = {
  cell: Cell;
  index: number;
  isGameOver: boolean;
  isDisabled: boolean;
  onPlay: (index: number) => void;
  hint?: Hint;
};

export function GameCell({ cell, index, isGameOver, onPlay, isDisabled, hint }: GameCellProps) {
  const label = hint
    ? `AI suggests square ${index + 1}. ${hint.message}`
    : cell === "-"
      ? `Empty square ${index + 1}`
      : `${cell} in square ${index + 1}`;

  return (
    <button
      className={cn(
        "relative grid aspect-square place-items-center rounded-[17px] border-[3px] border-ink text-[clamp(50px,14vw,72px)] font-bold leading-none transition duration-150 active:translate-y-0.5 disabled:cursor-default",
        cell === "-" && "bg-empty text-ink shadow-cell-empty",
        cell === "X" && "bg-coral-soft text-coral shadow-cell-x",
        cell === "O" && "bg-teal-soft text-teal shadow-cell-o",
        cell === "-" &&
          !isGameOver &&
          !isDisabled &&
          !hint &&
          "hover:-translate-y-1 hover:-rotate-2 hover:saturate-125",
      )}
      disabled={cell !== "-" || isGameOver || isDisabled}
      onClick={() => onPlay(index)}
      role="gridcell"
      aria-label={label}
    >
      {hint ? (
        <>
          <span
            key={`hint-ring-${hint.version}`}
            className="pointer-events-none absolute -inset-1 z-10 rounded-[21px] border-[3px] border-yellow ring-4 ring-yellow/35 motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <span
            key={`hint-spark-${hint.version}`}
            className="pointer-events-none absolute -right-2 -top-3 z-20 text-xl leading-none text-yellow motion-safe:animate-bounce"
            aria-hidden="true"
          >
            ✦
          </span>
          <span
            key={`hint-bubble-${hint.version}`}
            className="pointer-events-none absolute -top-11 left-1/2 z-30 -translate-x-1/2 -rotate-2 whitespace-nowrap rounded-lg border-2 border-ink bg-yellow-soft px-2 py-1 font-mono text-[9px] font-bold leading-tight text-ink shadow-button motion-safe:animate-bounce"
          >
            <span className="block">{hint.title}</span>
            <span className="block text-[8px] text-muted">{hint.message}</span>
            {hint.detail ? (
              <span className="block text-[8px] text-muted">{hint.detail}</span>
            ) : null}
          </span>
        </>
      ) : null}
      {cell === "-" ? (
        <span className="text-[28px] font-normal text-yellow-muted opacity-50">+</span>
      ) : (
        <PlayerMark player={cell} />
      )}
    </button>
  );
}
