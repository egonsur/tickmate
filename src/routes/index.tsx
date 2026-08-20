import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PRESET_GROUPS, formatControl } from "@/lib/time-control";
import { primeAudio } from "@/lib/feedback";
import { loadPrefs, savePrefs, type Prefs } from "@/lib/prefs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SchackMate — Chess Clock for Over-the-Board Play" },
      {
        name: "description",
        content:
          "A precise offline chess clock: bullet, blitz and rapid presets, Fischer increment, low-time warnings and flag fall. Companion app to SchackMate.",
      },
      { property: "og:title", content: "SchackMate — Chess Clock for Over-the-Board Play" },
      {
        property: "og:description",
        content:
          "Pick 3+2, tap start, put the phone beside the board. Offline chess clock with increment, warnings and flag fall.",
      },
    ],
  }),
  component: Home,
});

const MAX_MIN = 180;

function Home() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("3+2");
  const [minutes, setMinutes] = useState(7);
  const [seconds, setSeconds] = useState(0);
  const [increment, setIncrement] = useState(3);
  const [prefs, setPrefs] = useState<Prefs>({ sound: true, haptics: true });

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const updatePrefs = (next: Prefs) => {
    setPrefs(next);
    savePrefs(next);
  };

  const allPresets = PRESET_GROUPS.flatMap((g) => g.presets);
  const isCustom = selected === "custom";
  const customBase = minutes * 60_000 + seconds * 1000;
  const preset = allPresets.find((p) => p.id === selected);
  const chosen =
    isCustom || !preset
      ? { baseMs: Math.max(1000, customBase), incrementMs: increment * 1000 }
      : { baseMs: preset.baseMs, incrementMs: preset.incrementMs };

  const startGame = () => {
    primeAudio();
    void navigate({ to: "/game", search: { b: chosen.baseMs, i: chosen.incrementMs } });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="border-b-2 border-foreground px-6 pt-8 pb-5">
        <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
          Alocai's Chess Clock
        </p>
        <h1 className="flex items-center gap-2 text-4xl font-black tracking-tighter">
          <img
            src="/knight.png"
            alt="SchackMate knight"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          SchackMate
        </h1>
      </header>

      <div className="flex-1 space-y-8 overflow-y-auto p-4">
        {PRESET_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 flex justify-between px-2 text-[11px] font-bold tracking-widest uppercase">
              <span>{group.title}</span>
              <span className="text-muted-foreground">{group.index}</span>
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {group.presets.map((preset) => {
                const active = selected === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelected(preset.id)}
                    aria-pressed={active}
                    className={
                      active
                        ? "border-2 border-foreground bg-foreground p-3 text-left text-background ring-4 ring-foreground/10"
                        : "border-2 border-border p-3 text-left transition-colors hover:border-foreground"
                    }
                  >
                    <div className="font-mono text-lg font-bold whitespace-nowrap">
                      {preset.label}
                    </div>
                    <div className="text-[9px] uppercase opacity-50">{preset.sub}</div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-3 flex justify-between px-2 text-[11px] font-bold tracking-widest uppercase">
            <span>Custom</span>
            <span className="text-muted-foreground">04</span>
          </h2>
          <button
            type="button"
            onClick={() => setSelected("custom")}
            aria-pressed={isCustom}
            className={
              isCustom
                ? "w-full border-2 border-foreground p-4 text-left ring-4 ring-foreground/10"
                : "w-full border-2 border-dashed border-border p-4 text-left transition-colors hover:border-foreground"
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest uppercase">Custom Format</span>
              <span className="font-mono text-2xl font-extrabold">
                {formatControl({ baseMs: Math.max(1000, customBase), incrementMs: increment * 1000 })}
              </span>
            </div>
          </button>

          <div className="mt-2 grid grid-cols-3 gap-2">
            <Stepper
              label="Mins"
              value={minutes}
              min={0}
              max={MAX_MIN}
              onChange={(v) => {
                setMinutes(v);
                setSelected("custom");
              }}
            />
            <Stepper
              label="Secs"
              value={seconds}
              min={0}
              max={59}
              step={5}
              onChange={(v) => {
                setSeconds(v);
                setSelected("custom");
              }}
            />
            <Stepper
              label="Inc"
              value={increment}
              min={0}
              max={60}
              onChange={(v) => {
                setIncrement(v);
                setSelected("custom");
              }}
            />
          </div>
        </section>

        <section className="flex gap-2">
          <Toggle
            label="Sound"
            on={prefs.sound}
            onClick={() => updatePrefs({ ...prefs, sound: !prefs.sound })}
          />
          <Toggle
            label="Vibration"
            on={prefs.haptics}
            onClick={() => updatePrefs({ ...prefs, haptics: !prefs.haptics })}
          />
        </section>
      </div>

      <div className="p-6">
        <button
          type="button"
          onClick={startGame}
          className="w-full bg-foreground py-5 text-lg font-black tracking-[0.3em] text-background uppercase transition-transform active:scale-[0.98]"
        >
          Start Game
        </button>
      </div>
    </main>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="border-2 border-border">
      <div className="border-b border-border py-1 text-center text-[8px] tracking-widest uppercase opacity-50">
        {label}
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className="px-3 py-2 font-mono text-lg leading-none"
        >
          −
        </button>
        <div className="text-center font-mono text-xl tabular-nums">
          {String(value).padStart(2, "0")}
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className="px-3 py-2 font-mono text-lg leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        on
          ? "flex-1 border-2 border-foreground bg-foreground py-2 text-[10px] font-black tracking-widest text-background uppercase"
          : "flex-1 border-2 border-border py-2 text-[10px] font-black tracking-widest uppercase opacity-50"
      }
    >
      {label} {on ? "On" : "Off"}
    </button>
  );
}
