import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  children: ReactNode;
  className?: string;
  labelledBy: string;
  closeLabel: string;
  onClose: () => void;
  isDismissible?: boolean;
};

export function Modal({
  children,
  className,
  labelledBy,
  closeLabel,
  onClose,
  isDismissible = true,
}: ModalProps) {
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
        if (isDismissible && event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (isDismissible && event.key === "Escape") {
          onClose();
        }
      }}
    >
      <section
        className={cn(
          "relative w-full rounded-2xl border-[3px] border-ink bg-surface p-4 shadow-card sm:rounded-3xl sm:p-5",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-surface text-lg font-bold text-ink shadow-button transition hover:-translate-x-px hover:-translate-y-px hover:bg-coral-soft hover:shadow-button-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-button-active"
          onClick={onClose}
          aria-label={closeLabel}
          disabled={!isDismissible}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
        {children}
      </section>
    </div>
  );
}
