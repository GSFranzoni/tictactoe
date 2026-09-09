import type { PointerEvent as ReactPointerEvent } from "react";

let clickAudio: HTMLAudioElement | null = null;

const getClickAudio = () => {
  if (!clickAudio) {
    clickAudio = new Audio(`${import.meta.env.BASE_URL}sfx/typewriter-soft-click.wav`);
    clickAudio.preload = "auto";
    clickAudio.volume = 0.25;
  }

  return clickAudio;
};

export const preloadClickSound = () => {
  getClickAudio().load();
};

export const playClick = () => {
  const audio = getClickAudio();

  audio.currentTime = 0;

  void audio.play().catch(() => undefined);
};

export const playControlClick = (event: ReactPointerEvent<HTMLElement>) => {
  if (event.target instanceof Element && event.target.closest("button:not(:disabled), a[href]")) {
    playClick();
  }
};
