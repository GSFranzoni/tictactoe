import type { ReactNode } from "react";
import { interpolate, spring } from "remotion";
import type { Board } from "@/lib/game";
import { cn } from "@/lib/utils";

const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
export type TagTone = "ink" | "coral" | "teal";

const tagToneClasses: Record<TagTone, string> = {
  ink: "bg-surface text-ink",
  coral: "bg-coral text-surface",
  teal: "bg-teal text-surface",
};

export function Tag({ children, tone = "ink" }: { children: ReactNode; tone?: TagTone }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-[9px] border-2 border-ink px-3.25 py-2.25 font-mono text-[19px] leading-[1.35] shadow-[3px_4px_0_var(--ds-ink)]",
        tagToneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
export function ToyBoard({
  board,
  size,
  frame,
  at = -100,
  markAt = -100,
  markIndex = null,
  focusAt = -100,
  focusIndex = null,
  pressIndex = null,
  pressAt = -100,
}: {
  board: Board;
  size: number;
  frame: number;
  at?: number;
  markAt?: number;
  markIndex?: number | null;
  focusAt?: number;
  focusIndex?: number | null;
  pressIndex?: number | null;
  pressAt?: number;
}) {
  const p = spring({
    frame: frame - at,
    fps: 30,
    config: { damping: 24, stiffness: 170 },
  });
  const shadow = ramp(frame, at + 6, at + 20);
  return (
    <div
      className="grid grid-cols-3 grid-rows-3"
      style={{
        width: size,
        height: size,
        gap: size * 0.023,
        opacity: ramp(frame, at, at + 5),
        scale: 0.88 + 0.12 * p,
        translate: `0 ${(1 - p) * 22}px`,
        rotate: `${(1 - p) * -3}deg`,
      }}
    >
      {board.map((cell, i) => {
        const focus = i === focusIndex ? ramp(frame, focusAt, focusAt + 5) : 0;
        return (
          <div
            key={i}
            className={cn(
              "relative grid place-items-center border-ink",
              cell === "X" && "bg-coral-soft text-coral",
              cell === "O" && "bg-teal-soft text-teal",
              cell === "-" &&
                (i === pressIndex && frame >= pressAt && frame <= pressAt + 12
                  ? "bg-empty-pressed text-yellow-muted"
                  : "bg-empty text-yellow-muted"),
            )}
            style={{
              borderWidth: Math.max(2, size * 0.006),
              borderRadius: size * 0.035,
              translate:
                i === pressIndex
                  ? `0px ${interpolate(frame, [pressAt, pressAt + 5, pressAt + 12], [0, size * 0.015, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`
                  : "0px 0px",
              scale:
                i === pressIndex
                  ? interpolate(frame, [pressAt, pressAt + 5, pressAt + 12], [1, 0.985, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })
                  : 1,
              boxShadow: `inset 0 -${size * 0.012}px 0 ${cell === "X" ? "var(--ds-coral-border)" : cell === "O" ? "var(--ds-teal-border)" : "var(--ds-empty-shadow)"}, ${size * 0.007 * shadow}px ${size * 0.014 * shadow * (i === pressIndex ? interpolate(frame, [pressAt, pressAt + 5, pressAt + 12], [1, 0.65, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1)}px 0 var(--ds-ink), 0 0 0 ${size * 0.018 * focus}px ${cell === "X" ? "var(--ds-coral)" : "var(--ds-teal)"}`,
            }}
          >
            {cell === "-" ? (
              <span className="text-yellow-muted" style={{ fontSize: size * 0.075, opacity: 0.5 }}>
                +
              </span>
            ) : (
              <svg
                className="h-[65%] w-[65%] overflow-visible"
                viewBox="0 0 100 100"
                style={{
                  scale:
                    i === markIndex
                      ? spring({
                          frame: frame - markAt,
                          fps: 30,
                          config: { damping: 17, stiffness: 200 },
                        })
                      : 1,
                }}
                fill="none"
              >
                {cell === "X" ? (
                  <>
                    <path
                      d="M23 21 77 79 M77 21 23 79"
                      className="text-coral"
                      stroke="currentColor"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <path
                      d="M25 18 77 75"
                      className="text-surface"
                      stroke="currentColor"
                      strokeOpacity=".45"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    <circle
                      className="text-teal"
                      cx="50"
                      cy="50"
                      r="29"
                      stroke="currentColor"
                      strokeWidth="16"
                    />
                    <path
                      d="M34 29a29 29 0 0 1 22-8"
                      className="text-surface"
                      stroke="currentColor"
                      strokeOpacity=".65"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
export function Link({
  from,
  to,
  frame,
  at,
  selected = 0,
  dashed = false,
}: {
  from: [number, number];
  to: [number, number];
  frame: number;
  at: number;
  selected?: number;
  dashed?: boolean;
}) {
  const p = ramp(frame, at, at + 25);
  const d = `M ${from[0]} ${from[1]} C ${from[0]} ${(from[1] + to[1]) / 2} ${to[0]} ${(from[1] + to[1]) / 2} ${to[0]} ${to[1]}`;
  return (
    <svg
      className="pointer-events-none absolute -left-250 -top-125 h-[2000px] w-[2000px] overflow-visible"
      viewBox="-1000 -500 2000 2000"
    >
      <path
        d={d}
        fill="none"
        className="text-ink"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
        opacity={dashed ? 0.55 : 1}
      />
      <path
        d={d}
        fill="none"
        className="text-teal"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - selected}
        opacity={selected}
      />
    </svg>
  );
}
