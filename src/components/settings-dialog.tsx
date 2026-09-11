import { useState } from "react";
import { Modal } from "@/components/modal";
import { PlayerMark } from "@/components/player-mark";
import type { AiMode } from "@/lib/ai";
import type { GameSettings } from "@/hooks/use-tictactoe";
import type { TrainingAuditSnapshot } from "@/lib/neural-network";
import { cn } from "@/lib/utils";

type SettingsDialogProps = {
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void | Promise<void>;
  isTraining?: boolean;
  trainingProgress?: TrainingAuditSnapshot | null;
};

const playerOptions: { value: GameSettings["userPlayer"]; color: string }[] = [
  { value: "X", color: "text-coral" },
  { value: "O", color: "text-teal" },
];

const aiOptions: { value: AiMode; label: string; description: string }[] = [
  { value: "dumb", label: "Dumb", description: "Picks a random legal square." },
  { value: "minimax", label: "Minimax", description: "Calculates the optimal move." },
  { value: "neural", label: "Neural", description: "Learns from tic-tac-toe endgames." },
];

export function SettingsDialog({
  settings,
  onClose,
  onSave,
  isTraining = false,
  trainingProgress = null,
}: SettingsDialogProps) {
  const [draft, setDraft] = useState(settings);

  return (
    <Modal
      className="max-w-sm"
      labelledBy="settings-title"
      closeLabel="Close settings"
      onClose={onClose}
      isDismissible={!isTraining}
    >
      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-coral">
        Tiny control room
      </p>
      <h2 id="settings-title" className="mt-1 text-2xl font-bold tracking-tighter text-ink">
        Game settings
      </h2>

      <fieldset className="mt-4 sm:mt-5">
        <legend className="text-sm font-bold text-ink">You play as</legend>
        <div className="mt-2 flex gap-2">
          {playerOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "grid h-14 w-14 place-items-center rounded-xl border-2 transition sm:h-16 sm:w-16",
                draft.userPlayer === option.value
                  ? "border-ink bg-yellow-soft shadow-button"
                  : "border-neutral-border bg-neutral-panel hover:border-ink",
                option.color,
              )}
              onClick={() => setDraft((current) => ({ ...current, userPlayer: option.value }))}
              disabled={isTraining}
              aria-pressed={draft.userPlayer === option.value}
              aria-label={`Play as ${option.value}`}
            >
              <PlayerMark player={option.value} />
              <span className="sr-only">Play as {option.value}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 sm:mt-5">
        <legend className="text-sm font-bold text-ink">AI brain</legend>
        <div className="mt-2 grid gap-2">
          {aiOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-xl border-2 px-3 py-2.5 text-left transition sm:py-3 relative",
                draft.aiMode === option.value
                  ? "border-ink bg-teal-soft text-ink shadow-button"
                  : "border-neutral-border bg-neutral-panel text-muted hover:border-ink",
              )}
              onClick={() => setDraft((current) => ({ ...current, aiMode: option.value }))}
              disabled={isTraining}
              aria-pressed={draft.aiMode === option.value}
            >
              <span className="flex items-center justify-between gap-2 text-sm font-bold text-ink">
                <span>{option.label}</span>
                {option.value === "neural" && trainingProgress && (
                  <span className="font-mono text-[10px] text-teal">
                    Accuracy {(trainingProgress.accuracy * 100).toFixed(1)}%
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-xs">{option.description}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 flex justify-end gap-2 sm:mt-6">
        <button
          type="button"
          className="rounded-[10px] border-2 border-ink bg-surface px-3 py-2 text-xs font-bold text-ink transition hover:bg-yellow-soft"
          onClick={onClose}
          disabled={isTraining}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-[10px] border-2 border-ink bg-yellow-soft px-3 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-yellow hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active"
          onClick={() => void onSave(draft)}
          disabled={isTraining}
        >
          {isTraining ? "Training…" : "Start fresh game"}
        </button>
      </div>
    </Modal>
  );
}
