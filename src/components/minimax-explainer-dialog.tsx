import { Modal } from "@/components/modal";

type MinimaxExplainerDialogProps = {
  onClose: () => void;
};

export function MinimaxExplainerDialog({ onClose }: MinimaxExplainerDialogProps) {
  return (
    <Modal
      className="max-h-[calc(100vh-1.5rem)] max-w-2xl overflow-y-auto sm:max-h-[calc(100vh-2rem)]"
      labelledBy="minimax-explainer-title"
      closeLabel="Close Minimax explanation"
      onClose={onClose}
    >
      <p className="pr-9 font-mono text-[10px] uppercase tracking-[.12em] text-coral">
        Behind the AI move
      </p>
      <h2
        id="minimax-explainer-title"
        className="mt-1 pr-9 text-2xl font-bold tracking-tighter text-ink sm:text-3xl"
      >
        How Minimax works
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        Minimax looks ahead at every legal move and the futures that follow it. It assumes both
        players make their best possible choices, then works backward through the decision tree to
        select the move with the best guaranteed outcome.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border-2 border-ink bg-ink shadow-button">
        <video
          className="aspect-square w-full"
          controls
          preload="metadata"
          aria-label="Animated explanation of the Minimax decision tree"
        >
          <source src={`${import.meta.env.BASE_URL}assets/demo.mp4`} type="video/mp4" />
          Your browser does not support embedded video.
        </video>
      </div>
    </Modal>
  );
}
