import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const rows = Array.from({ length: 150 });
const cols = Array.from({ length: 100 });

const hoverColors = [
  "var(--ds-teal-bright)",
  "var(--ds-coral-soft)",
  "var(--ds-teal-soft)",
  "var(--ds-yellow-soft)",
  "var(--ds-coral-panel)",
  "var(--ds-teal-panel)",
  "var(--ds-yellow)",
];

const getRandomColor = () => hoverColors[Math.floor(Math.random() * hoverColors.length)];

export const BoxesCore = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      style={{
        transform:
          "translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)",
      }}
      className={cn(
        "absolute -top-1/4 left-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4",
        className,
      )}
      {...rest}
    >
      {rows.map((_, rowIndex) => (
        <motion.div key={`row-${rowIndex}`} className="relative h-8 w-16 border-l border-ink/25">
          {cols.map((_, columnIndex) => (
            <motion.div
              key={`cell-${rowIndex}-${columnIndex}`}
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              animate={{ transition: { duration: 2 } }}
              className="relative h-8 w-16 border-r border-t border-ink/25"
            >
              {columnIndex % 2 === 0 && rowIndex % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="pointer-events-none absolute -left-[22px] -top-[14px] h-6 w-10 text-ink/30 stroke-[1px]"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
