import type { CardTone, CardVisualKind } from "@/lib/design/card-spec";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<CardTone, string> = {
  editorial: "from-sky-50/80 via-white to-indigo-50/80",
  clinical: "from-cyan-50/80 via-white to-blue-100/80",
  practical: "from-emerald-50/80 via-white to-teal-50/80",
  warm: "from-amber-50/80 via-white to-orange-50/80",
};

type DataGlyphProps = {
  kind: CardVisualKind;
  tone?: CardTone;
  compact?: boolean;
  ariaLabel?: string;
  fallbackAriaLabel?: string;
  className?: string;
};

export function DataGlyph({
  kind,
  tone = "editorial",
  compact = false,
  ariaLabel,
  fallbackAriaLabel = "Structured assessment visual chart.",
  className,
}: DataGlyphProps) {
  const resolvedAriaLabel =
    ariaLabel?.trim() || fallbackAriaLabel.trim() || "Structured assessment visual chart.";

  return (
    <div
      role="img"
      aria-label={resolvedAriaLabel}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--fm-border)] bg-gradient-to-br",
        TONE_CLASSES[tone],
        compact ? "h-16" : "h-28",
        className
      )}
    >
      {kind === "bars_ocean" ? <BarsOcean compact={compact} /> : null}
      {kind === "wave_clinical" ? <WaveClinical compact={compact} /> : null}
      {kind === "grid_nine" ? <GridNine compact={compact} /> : null}
      {kind === "ring_four" ? <RingFour compact={compact} /> : null}
      {kind === "spark_minimal" ? <SparkMinimal compact={compact} /> : null}
    </div>
  );
}

function BarsOcean({ compact }: { compact: boolean }) {
  const bars = compact ? [38, 54, 34, 60, 42] : [34, 58, 28, 68, 46];

  return (
    <div className="absolute inset-0 flex items-end justify-between gap-2 px-4 pb-3 pt-6">
      {bars.map((height, idx) => (
        <div
          key={`bar-${idx}`}
          className={cn(
            "flex-1 rounded-t-sm bg-slate-300/90 transition-all duration-500 ease-out motion-safe:group-hover/card:bg-[var(--fm-accent)]",
            idx % 2 === 0 ? "motion-safe:group-hover/card:translate-y-[-2px]" : "",
            compact ? "max-h-12" : "max-h-20"
          )}
          style={{
            height: `${height}%`,
            transitionDelay: `${idx * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

function WaveClinical({ compact }: { compact: boolean }) {
  const height = compact ? 64 : 112;
  const pathA = "M0 38 C16 16, 32 62, 50 42 C68 24, 86 58, 104 40 C122 24, 138 52, 160 34";
  const pathB = "M0 54 C22 28, 42 80, 70 50 C92 30, 120 70, 160 46";

  return (
    <div className="absolute inset-0 px-2 py-2">
      <svg viewBox={`0 0 160 ${height}`} className="h-full w-full" fill="none" aria-hidden>
        <path d={pathB} stroke="rgba(15, 83, 184, 0.36)" strokeWidth="3" strokeLinecap="round" />
        <path
          d={pathA}
          stroke="rgba(14, 92, 211, 0.78)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="transition-all duration-500 ease-out motion-safe:group-hover/card:translate-y-[-2px]"
        />
        <circle cx="128" cy="44" r="4" fill="rgba(14, 92, 211, 0.96)" className="motion-safe:animate-pulse" />
      </svg>
    </div>
  );
}

function GridNine({ compact }: { compact: boolean }) {
  const dot = compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5";

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }, (_, idx) => (
          <span
            key={`dot-${idx}`}
            className={cn(
              "rounded-full border border-[var(--fm-border-strong)] bg-white/90 transition-all duration-500",
              dot,
              idx % 2 === 0 ? "motion-safe:group-hover/card:scale-110" : "motion-safe:group-hover/card:translate-y-[-1px]"
            )}
            style={{ transitionDelay: `${idx * 35}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function RingFour({ compact }: { compact: boolean }) {
  const sizeClass = compact ? "h-14 w-14" : "h-20 w-20";

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className={cn(
          "rounded-full border border-[var(--fm-border-strong)] bg-white/80 p-1.5 transition-transform duration-500 motion-safe:group-hover/card:rotate-12",
          sizeClass
        )}
      >
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 overflow-hidden rounded-full">
          <span className="bg-sky-200" />
          <span className="bg-indigo-300" />
          <span className="bg-cyan-300" />
          <span className="bg-blue-400" />
        </div>
      </div>
    </div>
  );
}

function SparkMinimal({ compact }: { compact: boolean }) {
  const bars = compact ? [24, 40, 30, 48, 34, 52, 38] : [22, 36, 28, 46, 30, 54, 34];

  return (
    <div className="absolute inset-0 flex items-end gap-1.5 px-4 pb-3 pt-6">
      {bars.map((height, idx) => (
        <span
          key={`spark-${idx}`}
          className="flex-1 rounded-sm bg-slate-300/90 transition-all duration-500 motion-safe:group-hover/card:bg-[var(--fm-accent)]"
          style={{
            height: `${height}%`,
            transitionDelay: `${idx * 35}ms`,
          }}
        />
      ))}
    </div>
  );
}
