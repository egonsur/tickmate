/** Sound + haptic feedback. Browser-only: never call during render or SSR. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Must be called from a user gesture once so iOS unlocks audio. */
export function primeAudio() {
  getCtx();
}

function tone(freq: number, durationMs: number, gain: number, type: OscillatorType = "square") {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = audio.currentTime;
  const dur = durationMs / 1000;
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(amp).connect(audio.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  press: () => tone(880, 45, 0.07),
  tick: () => tone(1320, 35, 0.06, "triangle"),
  urgentTick: () => tone(1600, 55, 0.1),
  flag: () => {
    tone(300, 260, 0.16, "sawtooth");
    setTimeout(() => tone(200, 420, 0.16, "sawtooth"), 240);
  },
};
