import { cn } from "@/lib/utils";

type Player = "X" | "O";

export function PlayerMark({ player, small = false }: { player: Player; small?: boolean }) {
  const size = cn(small ? "h-4 w-4" : "h-3/5 w-3/5");

  return player === "X" ? (
    <svg className={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M23 21 77 79M77 21 23 79"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M25 18 77 75"
        stroke="var(--ds-surface)"
        strokeOpacity=".45"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg className={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="29" stroke="currentColor" strokeWidth="16" />
      <path
        d="M34 29a29 29 0 0 1 22-8"
        stroke="var(--ds-surface)"
        strokeOpacity=".65"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
