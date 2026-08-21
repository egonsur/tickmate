import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatClock, formatControl } from "@/lib/time-control";
import { loadPrefs, type Prefs } from "@/lib/prefs";
import { useChessClock, type Side } from "@/hooks/use-chess-clock";
import { useWakeLock } from "@/hooks/use-wake-lock";

export const Route = createFileRoute("/game")({
  validateSearch: (search: Record<string, unknown>) => {
    const b = Number(search["b"]);
    const i = Number(search["i"]);
    return {
      b: Number.isFinite(b) && b > 0 ? Math.min(b, 6 * 3600_000) : 180_000,
      i: Number.isFinite(i) && i >= 0 ? Math.min(i, 120_000) : 2000,
    };
  },
  head: () => ({
    meta: [
      { title: "Clock Running — SchackMate" },
      {
        name: "description",
        content:
          "Live chess clock: tap your side to end your move, add the Fischer increment and start your opponent's clock.",
      },
      { property: "og:title", content: "Clock Running — SchackMate" },
      {
        property: "og:description",
        content: "Tap your side to end your move and start your opponent's clock.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GameScreen,
});

function GameScreen() {
  const { b, i } = Route.useSearch();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>({ sound: true, haptics: true });
  const [exitConfirm, setExitConfirm] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const { view, press, pause, resume } = useChessClock(
    { baseMs: b, incrementMs: i },
    prefs,
  );

  const finished = view.status === "WHITE_TIMEOUT" || view.status === "BLACK_TIMEOUT";
  const paused = view.status === "PAUSED";
  useWakeLock(!finished);

  const goHome = () => void navigate({ to: "/" });

  const attemptLeave = () => {
    if (view.status === "NOT_STARTED" || finished) {
      goHome();
    } else {
      setExitConfirm(true);
      if (view.status !== "PAUSED") {
        pause();
      }
    }
  };

  const resumeGame = () => {
    setExitConfirm(false);
    resume();
  };

  return (
    <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-foreground">
      <PlayerHalf
        side="black"
        ms={view.black}
        active={view.active === "black"}
        showStart={view.status === "NOT_STARTED"}
        disabled={finished || paused || exitConfirm}
        increment={i}
        onPress={() => press("black")}
      />

      <div className="flex h-12 shrink-0 items-center justify-between border-y-2 border-foreground bg-background px-4">
        <span className="font-mono text-[10px] font-bold uppercase opacity-50">
          {formatControl({ baseMs: b, incrementMs: i })}
        </span>
        <div className="flex h-full items-center">
          <button
            type="button"
            onClick={paused ? resumeGame : pause}
            disabled={finished || view.status === "NOT_STARTED"}
            className="h-full border-x border-border px-5 text-[10px] font-black tracking-widest uppercase transition-colors hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={attemptLeave}
            className="h-full px-5 text-[10px] font-black tracking-widest uppercase transition-colors hover:text-accent"
          >
            Exit
          </button>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase opacity-50">
          {statusLabel(view.status)}
        </span>
      </div>

      <PlayerHalf
        side="white"
        ms={view.white}
        active={view.active === "white"}
        showStart={false}
        disabled={finished || paused || exitConfirm}
        increment={i}
        onPress={() => press("white")}
      />

      {paused && (
        <Overlay>
          <p className="text-5xl font-black tracking-tighter uppercase">Paused</p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={resume}
              className="border-2 border-background px-12 py-4 text-sm font-black tracking-[0.3em] uppercase"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={attemptLeave}
              className="px-12 py-2 text-[11px] font-bold tracking-widest uppercase opacity-60"
            >
              Main screen
            </button>
          </div>
        </Overlay>
      )}

      {confirmLeave && (
        <Overlay>
          <p className="text-3xl font-black tracking-tighter uppercase">Leave game?</p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmLeave(false)}
              className="border-2 border-background px-8 py-4 text-xs font-black tracking-[0.2em] uppercase"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={goHome}
              className="bg-accent px-8 py-4 text-xs font-black tracking-[0.2em] text-accent-foreground uppercase"
            >
              Leave
            </button>
          </div>
        </Overlay>
      )}

      {finished && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-accent px-6 text-center text-accent-foreground">
          <div className="animate-flag h-24 w-16 bg-accent-foreground" aria-hidden />
          <div>
            <p className="text-5xl font-black tracking-tighter uppercase">Red Flag</p>
            <p className="mt-3 text-xl font-bold tracking-[0.15em] uppercase">
              {view.status === "WHITE_TIMEOUT" ? "White" : "Black"} lost on time
            </p>
            <p className="clock-digits mt-6 text-3xl">
              {view.status === "WHITE_TIMEOUT"
                ? `Black ${formatClock(view.black)}`
                : `White ${formatClock(view.white)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={goHome}
            className="border-2 border-accent-foreground px-12 py-4 text-sm font-black tracking-[0.3em] uppercase"
          >
            Main screen
          </button>
        </div>
      )}
    </main>
  );
}

function statusLabel(status: string) {
  if (status === "NOT_STARTED") return "Ready";
  if (status === "PAUSED") return "Paused";
  if (status.endsWith("TIMEOUT")) return "Flag";
  return "Running";
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-foreground/95 text-background">
      {children}
    </div>
  );
}

function PlayerHalf({
  side,
  ms,
  active,
  showStart,
  disabled,
  increment,
  onPress,
}: {
  side: Side;
  ms: number;
  active: boolean;
  showStart: boolean;
  disabled: boolean;
  increment: number;
  onPress: () => void;
}) {
  const isBlack = side === "black";
  const critical = ms <= 10_000;
  const warning = !critical && ms <= 30_000;

  const base = isBlack
    ? "bg-foreground text-background"
    : "bg-background text-foreground";
  const surface = critical
    ? "bg-accent text-accent-foreground"
    : warning
      ? isBlack
        ? "bg-foreground text-warning"
        : "bg-warning/15 text-foreground"
      : base;

  return (
    <button
      type="button"
      onPointerDown={disabled ? undefined : onPress}
      disabled={disabled}
      aria-label={`${side} clock`}
      className={`relative flex min-h-0 flex-1 flex-col items-center justify-between px-6 py-6 ${surface} ${
        isBlack ? "rotate-180" : ""
      } ${critical ? "animate-flag" : ""}`}
    >
      <div className="flex w-full items-start justify-between">
        <span className="text-[11px] font-black tracking-widest uppercase opacity-40">
          {side} player
        </span>
        {increment > 0 && (
          <span className="font-mono text-[11px] font-bold opacity-60">
            +{Math.round(increment / 1000)}s
          </span>
        )}
      </div>

      <span
        className="clock-digits"
        style={{ fontSize: "clamp(3.5rem, 22vw, 7rem)" }}
      >
        {formatClock(ms)}
      </span>

      <div className="flex h-12 items-center">
        {showStart ? (
          <span className="animate-blink border-2 border-current px-8 py-3 text-sm font-black tracking-[0.4em] uppercase">
            Start
          </span>
        ) : (
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
            {active ? "Your move" : ""}
          </span>
        )}
      </div>

      {active && (
        <span
          className="pointer-events-none absolute inset-0 ring-[6px] ring-accent ring-inset"
          aria-hidden
        />
      )}
    </button>
  );
}
