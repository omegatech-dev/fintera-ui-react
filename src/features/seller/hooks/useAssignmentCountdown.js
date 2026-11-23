import { useEffect, useState } from "react";
import { secondsUntil } from "../utils/assignment";

// A single shared 1s interval drives every live countdown. Previously each
// AssignmentCard owned its own setInterval, so N pending assignments meant N
// per-second timers (and N re-renders/second). The ticker only runs while at
// least one card still has time left, and each card unsubscribes when it
// expires or unmounts.
let nextId = 0;
const listeners = new Map();
let ticker = null;

function startTicker() {
  if (ticker !== null) return;
  ticker = setInterval(() => {
    for (const listener of [...listeners.values()]) listener();
  }, 1000);
}

function stopTickerIfIdle() {
  if (listeners.size === 0 && ticker !== null) {
    clearInterval(ticker);
    ticker = null;
  }
}

function subscribe(listener) {
  const id = nextId++;
  listeners.set(id, listener);
  startTicker();
  return () => {
    listeners.delete(id);
    stopTickerIfIdle();
  };
}

export const useAssignmentCountdown = (deadline) => {
  const [remaining, setRemaining] = useState(() => secondsUntil(deadline));

  useEffect(() => {
    const first = secondsUntil(deadline);
    setRemaining(first);
    if (first === null || first === 0) return undefined;

    let unsubscribe;
    const tick = () => {
      const value = secondsUntil(deadline);
      setRemaining(value);
      if (value === 0 && unsubscribe) unsubscribe();
    };
    unsubscribe = subscribe(tick);
    return () => unsubscribe();
  }, [deadline]);

  return remaining;
};
