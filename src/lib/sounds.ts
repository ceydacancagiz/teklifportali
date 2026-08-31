// Synthesized "coins jingling / dropping" sound using the Web Audio API (no asset needed).

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function getNoise(audio: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const len = Math.floor(audio.sampleRate * 0.4);
    noiseBuffer = audio.createBuffer(1, len, audio.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** One short metallic "şıngır" — bright filtered noise burst + ringing partials. */
function clink(audio: AudioContext, at: number, freq: number, gain: number, out: AudioNode) {
  // Bright noise transient (the "ching" attack)
  const src = audio.createBufferSource();
  src.buffer = getNoise(audio);
  src.playbackRate.value = 0.8 + Math.random() * 0.6;

  const bp = audio.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(freq * 2.2, at);
  bp.Q.value = 6;

  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1500;

  const nEnv = audio.createGain();
  nEnv.gain.setValueAtTime(0.0001, at);
  nEnv.gain.exponentialRampToValueAtTime(gain * 0.9, at + 0.002);
  nEnv.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);

  src.connect(bp).connect(hp).connect(nEnv).connect(out);
  src.start(at);
  src.stop(at + 0.2);

  // Inharmonic ringing partials (the metal ring after the hit)
  [1, 2.76, 5.4, 8.9].forEach((mult, i) => {
    const osc = audio.createOscillator();
    const env = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * mult * (0.99 + Math.random() * 0.02), at);
    const peak = (gain * 0.5) / (i + 1);
    const dur = 0.25 + Math.random() * 0.35 - i * 0.03;
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(peak, at + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.08, dur));
    osc.connect(env).connect(out);
    osc.start(at);
    osc.stop(at + 0.7);
  });
}

/** Plays a cascade of coins falling and bouncing — "şıngır şıngır". */
export function playCoinsSound() {
  const audio = getCtx();
  if (!audio) return;

  const master = audio.createGain();
  master.gain.value = 0.5;
  master.connect(audio.destination);

  const now = audio.currentTime + 0.02;
  const coins = 7;

  for (let c = 0; c < coins; c++) {
    const start = now + c * (0.05 + Math.random() * 0.07);
    const freq = 1600 + Math.random() * 1600;
    // each coin bounces a few times, faster and quieter
    let t = start;
    let g = 0.22 + Math.random() * 0.1;
    let gap = 0.09 + Math.random() * 0.06;
    const bounces = 3 + Math.floor(Math.random() * 3);
    for (let b = 0; b < bounces; b++) {
      clink(audio, t, freq * (1 + b * 0.03), g, master);
      t += gap;
      gap *= 0.62;
      g *= 0.6;
    }
  }
}
