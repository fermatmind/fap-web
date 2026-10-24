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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--fm-border)] bg-white p-6 shadow-[var(--fm-shadow-lg)]">
        <p className="m-0 text-base font-semibold text-[var(--fm-text)]" role="status" aria-live="polite" aria-busy="true">
          {phases[safeIndex]}
        </p>

        <div className="h-2 rounded-full bg-[var(--fm-surface-muted)] motion-safe:animate-pulse" aria-hidden />
      </div>
    </div>
  );
}
