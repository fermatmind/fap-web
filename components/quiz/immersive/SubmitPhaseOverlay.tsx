import { cn } from "@/lib/utils";

const PHASE_PROGRESS = [30, 70, 100] as const;

export function SubmitPhaseOverlay({
  visible,
  phases,
  phaseIndex,
}: {
  visible: boolean;
  phases: [string, string, string];
  phaseIndex: number;
}) {
  if (!visible) return null;

  const safeIndex = Math.min(Math.max(phaseIndex, 0), phases.length - 1);
  const progress = PHASE_PROGRESS[safeIndex] ?? 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--fm-border)] bg-white p-6 shadow-[var(--fm-shadow-lg)]">
        <p className="m-0 text-base font-semibold text-[var(--fm-text)]" aria-live="polite">
          {phases[safeIndex]}
        </p>

        <div className="h-2 overflow-hidden rounded-full bg-[var(--fm-surface-muted)]" aria-hidden>
          <div
            className={cn("h-full bg-gradient-to-r from-[var(--fm-trust-blue)] to-[var(--fm-teal)] transition-all duration-500")}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
