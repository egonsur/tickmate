import { useCallback, useEffect, useRef, useState } from "react";
import type { TimeControl } from "@/lib/time-control";
import { sfx, vibrate } from "@/lib/feedback";

export type Side = "white" | "black";
export type Status =
  | "NOT_STARTED"
  | "WHITE_RUNNING"
  | "BLACK_RUNNING"
  | "PAUSED"
  | "WHITE_TIMEOUT"
  | "BLACK_TIMEOUT";

export type ClockView = {
  status: Status;
  white: number;
  black: number;
  active: Side | null;
};

type Engine = {
  remaining: Record<Side, number>;
  status: Status;
  turnStart: number | null;
  resumeTo: Status | null;
  lastTickSecond: number;
};

const runningSide = (status: Status): Side | null =>
  status === "WHITE_RUNNING" ? "white" : status === "BLACK_RUNNING" ? "black" : null;

export function useChessClock(control: TimeControl, prefs: { sound: boolean; haptics: boolean }) {
  const engine = useRef<Engine>({
    remaining: { white: control.baseMs, black: control.baseMs },
    status: "NOT_STARTED",
    turnStart: null,
    resumeTo: null,
    lastTickSecond: -1,
  });

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const [view, setView] = useState<ClockView>({
    status: "NOT_STARTED",
    white: control.baseMs,
    black: control.baseMs,
    active: null,
  });

  const snapshot = useCallback((now: number): ClockView => {
    const e = engine.current;
    const active = runningSide(e.status);
    const elapsed = active && e.turnStart !== null ? now - e.turnStart : 0;
    return {
      status: e.status,
      active,
      white: active === "white" ? e.remaining.white - elapsed : e.remaining.white,
      black: active === "black" ? e.remaining.black - elapsed : e.remaining.black,
    };
  }, []);

  /** Folds elapsed real time into the active player's stored remaining time. */
  const commit = useCallback((now: number) => {
    const e = engine.current;
    const active = runningSide(e.status);
    if (!active || e.turnStart === null) return;
    e.remaining[active] = e.remaining[active] - (now - e.turnStart);
    e.turnStart = now;
  }, []);

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      const now = Date.now();
      const e = engine.current;
      const active = runningSide(e.status);

      if (active && e.turnStart !== null) {
        const left = e.remaining[active] - (now - e.turnStart);
        if (left <= 0) {
          e.remaining[active] = 0;
          e.turnStart = null;
          e.status = active === "white" ? "WHITE_TIMEOUT" : "BLACK_TIMEOUT";
          if (prefsRef.current.sound) sfx.flag();
          if (prefsRef.current.haptics) vibrate([120, 80, 120, 80, 260]);
        } else if (left <= 10_000) {
          const second = Math.ceil(left / 1000);
          if (second !== e.lastTickSecond) {
            e.lastTickSecond = second;
            if (prefsRef.current.sound) sfx.urgentTick();
          }
        }
      }

      setView(snapshot(now));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [snapshot]);

  const press = useCallback(
    (side: Side) => {
      const e = engine.current;
      const now = Date.now();
      const { sound, haptics } = prefsRef.current;

      const start = (next: Status) => {
        e.status = next;
        e.turnStart = now;
        e.lastTickSecond = -1;
        if (sound) sfx.press();
        if (haptics) vibrate(18);
        setView(snapshot(now));
      };

      if (e.status === "NOT_STARTED") {
        // Black starts the clock; White's time begins to run.
        if (side !== "black") return;
        start("WHITE_RUNNING");
        return;
      }

      const active = runningSide(e.status);
      if (!active || active !== side) return;

      commit(now);
      e.remaining[side] += control.incrementMs;
      start(side === "white" ? "BLACK_RUNNING" : "WHITE_RUNNING");
    },
    [commit, control.incrementMs, snapshot],
  );

  const pause = useCallback(() => {
    const e = engine.current;
    const now = Date.now();
    const active = runningSide(e.status);
    if (!active) return;
    commit(now);
    e.resumeTo = e.status;
    e.status = "PAUSED";
    e.turnStart = null;
    setView(snapshot(now));
  }, [commit, snapshot]);

  const resume = useCallback(() => {
    const e = engine.current;
    if (e.status !== "PAUSED" || !e.resumeTo) return;
    const now = Date.now();
    e.status = e.resumeTo;
    e.resumeTo = null;
    e.turnStart = now;
    e.lastTickSecond = -1;
    setView(snapshot(now));
  }, [snapshot]);

  return { view, press, pause, resume };
}
