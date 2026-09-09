let clickAudio: HTMLAudioElement | null = null;

export const playClick = () => {
  if (!clickAudio) {
    clickAudio = new Audio(`${import.meta.env.BASE_URL}sfx/typewriter-soft-click.wav`);
    clickAudio.volume = 0.4;
  }
  clickAudio.currentTime = 0;
  void clickAudio.play();
};
