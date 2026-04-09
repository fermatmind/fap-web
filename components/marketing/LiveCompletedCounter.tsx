"use client";

import { useSyncExternalStore } from "react";
import { AnimatedCounter, type AnimatedCounterProps } from "@/components/design/AnimatedCounter";
import {
  getRandomLiveCompletedCountIncrement,
  LIVE_COMPLETED_COUNT,
  LIVE_COMPLETED_COUNT_TICK_MS,
} from "@/lib/marketing/completionStats";

let currentCompletedCount = LIVE_COMPLETED_COUNT;
let intervalId: ReturnType<typeof window.setInterval> | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function ensureCounterTicker() {
  if (typeof window === "undefined" || intervalId) {
    return;
  }

  intervalId = window.setInterval(() => {
    currentCompletedCount += getRandomLiveCompletedCountIncrement();
    emitChange();
  }, LIVE_COMPLETED_COUNT_TICK_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureCounterTicker();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  return currentCompletedCount;
}

export function LiveCompletedCounter(props: Omit<AnimatedCounterProps, "value">) {
  const liveCompletedCount = useSyncExternalStore(subscribe, getSnapshot, () => LIVE_COMPLETED_COUNT);
  return <AnimatedCounter {...props} value={liveCompletedCount} />;
}
