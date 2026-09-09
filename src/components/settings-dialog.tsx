import { useEffect, useRef, useState } from "react";
import { PlayerMark } from "@/components/player-mark";
import type { AiMode } from "@/lib/ai";
import type { GameSettings } from "@/hooks/use-tictactoe";
import { cn } from "@/lib/utils";

type SettingsDialogProps = {
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
};

const playerOptions: { value: GameSettings["userPlayer"]; color: string }[] = [
  { value: "X", color: "text-coral" },
  { value: "O", color: "text-teal" },
];

const aiOptions: { value: AiMode; label: string; description: string }[] = [
  { value: "dumb", label: "Dumb", description: "Picks a random legal square." },
  { value: "minimax", label: "Minimax", description: "Calculates the optimal move." },
];

export function SettingsDialog({ settings, onClose, onSave }: SettingsDialogProps) {
  const [draft, setDraft] = useState(settings);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      lastFocusedElement.current?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-3 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <section
        className="relative w-full max-w-sm rounded-2xl border-[3px] border-ink bg-surface p-4 shadow-card sm:rounded-3xl sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-surface text-lg font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-coral-soft hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active"
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
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
                  "rounded-xl border-2 px-3 py-2.5 text-left transition sm:py-3",
                  draft.aiMode === option.value
                    ? "border-ink bg-teal-soft text-ink shadow-button"
                    : "border-neutral-border bg-neutral-panel text-muted hover:border-ink",
                )}
                onClick={() => setDraft((current) => ({ ...current, aiMode: option.value }))}
                aria-pressed={draft.aiMode === option.value}
              >
                <span className="block text-sm font-bold text-ink">{option.label}</span>
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
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-[10px] border-2 border-ink bg-yellow-soft px-3 py-2 text-xs font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-yellow hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active"
            onClick={() => onSave(draft)}
          >
            Start fresh game
          </button>
        </div>
      </section>
    </div>
  );
}
