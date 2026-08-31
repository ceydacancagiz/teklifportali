// Synthesized "coins dropping" sound using the Web Audio API (no asset needed).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function clink(at: number, freq: number, gain: number) {
  const audio = getCtx();
  if (!audio) return;

  // Metallic body: a couple of inharmonic partials
  [1, 2.41, 3.83].forEach((mult, i) => {
    const osc = audio.createOscillator();
    const env = audio.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq * mult, at);
    const peak = gain / (i + 1.5);
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(peak, at + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.18 + i * 0.05);
    osc.connect(env).connect(audio.destination);
    osc.start(at);
    osc.stop(at + 0.3);
  });
}

/** Plays a short cascade of coins falling. */
export function playCoinsSound() {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime + 0.01;
  const count = 9;
  for (let i = 0; i < count; i++) {
    const t = now + i * (0.045 + Math.random() * 0.05);
    const freq = 900 + Math.random() * 1100;
    const gain = 0.16 + Math.random() * 0.1;
    clink(t, freq, gain);
  }
}
