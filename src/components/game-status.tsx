import { cn } from "@/lib/utils";

type Player = "X" | "O";

type GameStatusProps = {
  currentPlayer: Player | null;
  winner: Player | null;
  message: string;
  isThinking: boolean;
};

export function GameStatus({ currentPlayer, winner, message, isThinking }: GameStatusProps) {
  const isO = winner === "O" || (!winner && currentPlayer === "O");

  return (
    <div
      className="mx-auto mb-5 flex min-h-8.75 w-fit items-center justify-center gap-2 rounded-full border-2 border-neutral-border px-3.5 py-1.5 text-[13px] font-semibold text-muted"
      aria-live="polite"
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full border-2 border-ink",
          isO ? "bg-teal-bright" : "bg-yellow",
        )}
        aria-hidden="true"
      />
      {message}
      {isThinking && (
        <span className="ml-0.5 inline-flex gap-0.5" aria-label="thinking">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce [animation-delay:150ms]">.</span>
          <span className="animate-bounce [animation-delay:300ms]">.</span>
        </span>
      )}
    </div>
  );
}
