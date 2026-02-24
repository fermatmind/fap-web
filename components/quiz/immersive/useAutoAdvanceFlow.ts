import { useCallback, useEffect, useRef, useState } from "react";

type TransitionDirection = "forward" | "backward" | "none";
export type LastSelectionContext = {
  questionId: string;
  code: string;
};

export function useAutoAdvanceFlow({
  currentIndex,
  total,
  onMove,
  onLast,
  confirmDelayMs = 200,
  enterDurationMs = 280,
}: {
  currentIndex: number;
  total: number;
  onMove: (index: number) => void;
  onLast: (selection?: LastSelectionContext) => Promise<void> | void;
  confirmDelayMs?: number;
  enterDurationMs?: number;
}) {
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>("none");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const indexRef = useRef(currentIndex);
  const totalRef = useRef(total);
  const confirmTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  const clearConfirmTimer = () => {
    if (confirmTimerRef.current) {
      window.clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
  };

  const clearSettleTimer = () => {
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  };

  const settleToIdle = useCallback(() => {
    clearSettleTimer();
    settleTimerRef.current = window.setTimeout(() => {
      setTransitionDirection("none");
    }, enterDurationMs);
  }, [enterDurationMs]);

  const cancelPending = useCallback(() => {
    clearConfirmTimer();
    setIsTransitioning(false);
  }, []);

  const selectAndAdvance = useCallback(
    (onSelect: () => void, selection?: LastSelectionContext) => {
      onSelect();
      cancelPending();
      clearSettleTimer();
      setTransitionDirection("forward");
      setIsTransitioning(true);

      confirmTimerRef.current = window.setTimeout(() => {
        const idx = indexRef.current;
        const safeTotal = totalRef.current;
        setIsTransitioning(false);

        if (safeTotal <= 0) {
          setTransitionDirection("none");
          return;
        }

        if (idx >= safeTotal - 1) {
          void onLast(selection);
          setTransitionDirection("none");
          return;
        }

        onMove(Math.min(safeTotal - 1, idx + 1));
        settleToIdle();
      }, confirmDelayMs);
    },
    [cancelPending, confirmDelayMs, onLast, onMove, settleToIdle]
  );

  const goPrevious = useCallback(() => {
    cancelPending();
    clearSettleTimer();
    const idx = indexRef.current;
    if (idx <= 0) {
      setTransitionDirection("none");
      return;
    }

    setTransitionDirection("backward");
    onMove(idx - 1);
    settleToIdle();
  }, [cancelPending, onMove, settleToIdle]);

  useEffect(() => {
    return () => {
      clearConfirmTimer();
      clearSettleTimer();
    };
  }, []);

  return {
    transitionDirection,
    isTransitioning,
    selectAndAdvance,
    goPrevious,
    cancelPending,
  };
}
