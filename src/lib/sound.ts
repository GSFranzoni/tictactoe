let audioContext: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;

const getAudioContext = () => {
  audioContext ??= new AudioContext();
  return audioContext;
};

export const preloadClickSound = async () => {
  const context = getAudioContext();

  const response = await fetch(`${import.meta.env.BASE_URL}sfx/typewriter-soft-click.wav`);

  const buffer = await response.arrayBuffer();

  clickBuffer = await context.decodeAudioData(buffer);
};

export const playClick = () => {
  if (!clickBuffer) {
    return;
  }

  const context = getAudioContext();

  void context.resume();

  const source = context.createBufferSource();
  const gain = context.createGain();

  gain.gain.value = 0.4;

  source.buffer = clickBuffer;
  source.connect(gain);
  gain.connect(context.destination);

  source.start();
};
