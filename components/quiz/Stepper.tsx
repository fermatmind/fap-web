export function Stepper({ currentIndex, total }: { currentIndex: number; total: number }) {
  const safeTotal = Math.max(total, 1);
  const step = Math.min(currentIndex + 1, safeTotal);
  const percent = Math.round((step / safeTotal) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontWeight: 600 }}>
        Step {step} / {safeTotal}
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "#f0f0f0",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: "#111",
            transition: "width 200ms ease"
          }}
        />
      </div>
    </div>
  );
}
