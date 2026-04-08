import type { MiniStrainRadarData } from "@/lib/mbti/personalityHub.types";

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function MiniStrainRadar({
  data,
}: {
  data: MiniStrainRadarData;
}) {
  const size = 160;
  const center = size / 2;
  const maxRadius = 48;
  const angleStep = (Math.PI * 2) / data.axes.length;
  const points = data.axes.map((axis, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const radius = (axis.value / 100) * maxRadius;
    return polarToCartesian(center, center, radius, angle);
  });
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-hub-friction-rose)]">
          {data.title}
        </p>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">{data.subtitle}</p>
      </div>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-40 w-40"
        role="img"
        aria-label={data.title}
      >
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const ringPoints = data.axes
            .map((_, index) => {
              const angle = -Math.PI / 2 + index * angleStep;
              const point = polarToCartesian(center, center, maxRadius * ratio, angle);
              return `${point.x},${point.y}`;
            })
            .join(" ");

          return (
            <polygon
              key={ratio}
              points={ringPoints}
              fill="none"
              stroke="var(--fm-border)"
              strokeWidth="1"
            />
          );
        })}
        {data.axes.map((axis, index) => {
          const angle = -Math.PI / 2 + index * angleStep;
          const point = polarToCartesian(center, center, maxRadius, angle);
          return (
            <line
              key={axis.key}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="var(--fm-border)"
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={polygonPoints}
          fill="color-mix(in srgb, var(--fm-hub-friction-rose) 26%, transparent)"
          stroke="var(--fm-hub-friction-rose)"
          strokeWidth="2"
        />
      </svg>
      <div className="grid grid-cols-2 gap-2">
        {data.axes.map((axis) => (
          <div key={axis.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-2">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
              {axis.label}
            </p>
            <p className="mb-0 mt-1 text-sm font-medium text-[var(--fm-text)]">{axis.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
