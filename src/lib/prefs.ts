export type CustomFormat = {
  /** 0-180 */
  minutes: number;
  /** 0-59 */
  seconds: number;
  /** 0-60 */
  increment: number;
};

export type Prefs = {
  sound: boolean;
  haptics: boolean;
  custom: CustomFormat;
};

const KEY = "schackmate.prefs.v2";
const LEGACY_KEYS = ["clockmate.prefs", "tickmate.prefs", "schackmate.prefs"];

export const DEFAULT_CUSTOM: CustomFormat = { minutes: 7, seconds: 0, increment: 3 };
const DEFAULTS: Prefs = { sound: true, haptics: true, custom: DEFAULT_CUSTOM };

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Accepts any shape (old schema, partial, malformed) and returns valid prefs. */
export function validatePrefs(input: unknown): Prefs {
  if (!input || typeof input !== "object") return DEFAULTS;
  const raw = input as Record<string, unknown>;
  const rawCustom =
    raw["custom"] && typeof raw["custom"] === "object"
      ? (raw["custom"] as Record<string, unknown>)
      : {};
  return {
    sound: typeof raw["sound"] === "boolean" ? raw["sound"] : DEFAULTS.sound,
    haptics: typeof raw["haptics"] === "boolean" ? raw["haptics"] : DEFAULTS.haptics,
    custom: {
      minutes: clampInt(rawCustom["minutes"], 0, 180, DEFAULT_CUSTOM.minutes),
      seconds: clampInt(rawCustom["seconds"], 0, 59, DEFAULT_CUSTOM.seconds),
      increment: clampInt(rawCustom["increment"], 0, 60, DEFAULT_CUSTOM.increment),
    },
  };
}

/** Browser-only. Call from useEffect or an event handler, never during render. */
export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    let raw = window.localStorage.getItem(KEY);
    if (!raw) {
      for (const legacy of LEGACY_KEYS) {
        const found = window.localStorage.getItem(legacy);
        if (found) {
          raw = found;
          break;
        }
      }
    }
    if (!raw) return DEFAULTS;
    return validatePrefs(JSON.parse(raw));
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(validatePrefs(prefs)));
    for (const legacy of LEGACY_KEYS) window.localStorage.removeItem(legacy);
  } catch {
    /* storage unavailable */
  }
}
