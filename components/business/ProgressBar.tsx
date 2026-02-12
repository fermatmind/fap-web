export type ProgressBarProps = {
  currentStep: number;
  total: number;
};

export function ProgressBar({ currentStep, total }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const current = Math.min(currentStep + 1, safeTotal);
  const percent = Math.round((current / safeTotal) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
        {current}/{safeTotal}
      </div>
      <div
        aria-hidden
        style={{
          height: 8,
          borderRadius: 999,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#111827",
            transition: "width 180ms ease",
          }}
        />
      </div>
    </div>
  );
}

