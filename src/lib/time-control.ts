export type TimeControl = {
  /** Base time per player, in milliseconds. */
  baseMs: number;
  /** Fischer increment per move, in milliseconds. */
  incrementMs: number;
};

export type Preset = {
  id: string;
  label: string;
  sub: string;
  baseMs: number;
  incrementMs: number;
};

const min = (m: number) => m * 60_000;
const sec = (s: number) => s * 1000;

export const PRESET_GROUPS: { title: string; index: string; presets: Preset[] }[] = [
  {
    title: "Bullet",
    index: "01",
    presets: [
      { id: "1+0", label: "1:00", sub: "1 min", baseMs: min(1), incrementMs: 0 },
      { id: "1+1", label: "1+1", sub: "1m + 1s", baseMs: min(1), incrementMs: sec(1) },
      { id: "2+1", label: "2+1", sub: "2m + 1s", baseMs: min(2), incrementMs: sec(1) },
    ],
  },
  {
    title: "Blitz",
    index: "02",
    presets: [
      { id: "3+0", label: "3:00", sub: "3 min", baseMs: min(3), incrementMs: 0 },
      { id: "3+2", label: "3+2", sub: "3m + 2s", baseMs: min(3), incrementMs: sec(2) },
      { id: "5+0", label: "5:00", sub: "5 min", baseMs: min(5), incrementMs: 0 },
    ],
  },
  {
    title: "Rapid",
    index: "03",
    presets: [
      { id: "10+0", label: "10:00", sub: "10 min", baseMs: min(10), incrementMs: 0 },
      { id: "15+10", label: "15+10", sub: "15m + 10s", baseMs: min(15), incrementMs: sec(10) },
      { id: "30+0", label: "30:00", sub: "30 min", baseMs: min(30), incrementMs: 0 },
    ],
  },
];

/** Formats remaining milliseconds as 3:00.0 / 0:09.4 — always one tenth. */
export function formatClock(ms: number): string {
  const clamped = Math.max(0, ms);
  const tenths = Math.floor(clamped / 100);
  const totalSeconds = Math.floor(tenths / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths % 10}`;
}

/** Human-readable format string, e.g. "7+3" or "5:00". */
export function formatControl(tc: TimeControl): string {
  const totalSeconds = Math.round(tc.baseMs / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const base = s === 0 ? `${m}` : `${m}:${String(s).padStart(2, "0")}`;
  const inc = Math.round(tc.incrementMs / 1000);
  return inc > 0 ? `${base}+${inc}` : `${base}:00`.replace(/^(\d+):00:00$/, "$1:00");
}
