export type Prefs = { sound: boolean; haptics: boolean };

const KEY = "clockmate.prefs";
const DEFAULTS: Prefs = { sound: true, haptics: true };

/** Browser-only. Call from useEffect or an event handler, never during render. */
export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      sound: parsed.sound ?? DEFAULTS.sound,
      haptics: parsed.haptics ?? DEFAULTS.haptics,
    };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable */
  }
}
