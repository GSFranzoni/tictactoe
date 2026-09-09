type WinningLineProps = { coordinates: [number, number, number, number]; player: "X" | "O" };

export function WinningLine({ coordinates, player }: WinningLineProps) {
  const color = player === "X" ? "var(--ds-coral)" : "var(--ds-teal)";

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      role="img"
      aria-label={`Winning line for ${player}`}
    >
      <line
        x1={coordinates[0]}
        y1={coordinates[1]}
        x2={coordinates[2]}
        y2={coordinates[3]}
        stroke="var(--ds-surface)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity=".8"
      />
      <line
        x1={coordinates[0]}
        y1={coordinates[1] - 0.6}
        x2={coordinates[2]}
        y2={coordinates[3] - 0.6}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="7 2 3 1"
        opacity=".45"
      />
      <line
        x1={coordinates[0]}
        y1={coordinates[1]}
        x2={coordinates[2]}
        y2={coordinates[3]}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 1.5 2 1"
      />
    </svg>
  );
}
