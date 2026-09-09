type Score = { X: number; O: number; draws: number };

export function Scoreboard({ score }: { score: Score }) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Scoreboard">
      <div className="rounded-xl border-2 border-coral-border bg-coral-panel px-2 py-2 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-coral">Player X</div>
        <div className="mt-0.5 text-xl font-bold text-ink">{score.X}</div>
      </div>
      <div className="rounded-xl border-2 border-neutral-border bg-neutral-panel px-2 py-2 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">
          Draws
        </div>
        <div className="mt-0.5 text-xl font-bold text-ink">{score.draws}</div>
      </div>
      <div className="rounded-xl border-2 border-teal-border bg-teal-panel px-2 py-2 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-teal">Player O</div>
        <div className="mt-0.5 text-xl font-bold text-ink">{score.O}</div>
      </div>
    </div>
  );
}
