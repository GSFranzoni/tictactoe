import { getOtherPlayer, type Player } from "@/lib/game";
import { cn } from "@/lib/utils";

type Score = { X: number; O: number; draws: number };

const playerStyles = {
  X: {
    panel: "border-coral-border bg-coral-panel",
    label: "text-coral",
  },
  O: {
    panel: "border-teal-border bg-teal-panel",
    label: "text-teal",
  },
} as const;

function ScoreCard({ label, player, value }: { label: string; player: Player; value: number }) {
  const styles = playerStyles[player];

  return (
    <div
      className={cn("rounded-xl border-2 px-1.5 py-1.5 text-center sm:px-2 sm:py-2", styles.panel)}
    >
      <div
        className={cn(
          "text-[9px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-wider",
          styles.label,
        )}
      >
        {label} · {player}
      </div>
      <div className="mt-0.5 text-lg font-bold text-ink sm:text-xl">{value}</div>
    </div>
  );
}

export function Scoreboard({ score, userPlayer }: { score: Score; userPlayer: Player }) {
  const aiPlayer = getOtherPlayer(userPlayer);

  return (
    <div
      className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-5 sm:gap-2"
      aria-label="You versus AI scoreboard"
    >
      <ScoreCard label="You" player={userPlayer} value={score[userPlayer]} />
      <div className="rounded-xl border-2 border-neutral-border bg-neutral-panel px-1.5 py-1.5 text-center sm:px-2 sm:py-2">
        <div className="text-[9px] font-bold uppercase tracking-wide text-neutral-muted sm:text-[10px] sm:tracking-wider">
          Draws
        </div>
        <div className="mt-0.5 text-lg font-bold text-ink sm:text-xl">{score.draws}</div>
      </div>
      <ScoreCard label="AI" player={aiPlayer} value={score[aiPlayer]} />
    </div>
  );
}
