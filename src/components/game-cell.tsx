import { PlayerMark } from "@/components/player-mark";
import { cn } from "@/lib/utils";

type Cell = "X" | "O" | "-";

type GameCellProps = {
  cell: Cell;
  index: number;
  isGameOver: boolean;
  isDisabled: boolean;
  onPlay: (index: number) => void;
};

export function GameCell({ cell, index, isGameOver, onPlay, isDisabled }: GameCellProps) {
  return (
    <button
      className={cn(
        "grid aspect-square place-items-center rounded-[17px] border-[3px] border-ink text-[clamp(50px,14vw,72px)] font-bold leading-none transition duration-150 active:translate-y-0.5 disabled:cursor-default",
        cell === "-" && "bg-empty text-ink shadow-cell-empty",
        cell === "X" && "bg-coral-soft text-coral shadow-cell-x",
        cell === "O" && "bg-teal-soft text-teal shadow-cell-o",
        cell === "-" &&
          !isGameOver &&
          !isDisabled &&
          "hover:-translate-y-1 hover:-rotate-2 hover:saturate-125",
      )}
      disabled={cell !== "-" || isGameOver || isDisabled}
      onClick={() => onPlay(index)}
      role="gridcell"
      aria-label={cell === "-" ? `Empty square ${index + 1}` : `${cell} in square ${index + 1}`}
    >
      {cell === "-" ? (
        <span className="text-[28px] font-normal text-yellow-muted opacity-50">+</span>
      ) : (
        <PlayerMark player={cell} />
      )}
    </button>
  );
}
