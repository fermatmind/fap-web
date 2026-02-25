import { cn } from "@/lib/utils";

type HeroAnimatedVisualProps = {
  chips: string[];
  localeLabel: "zh" | "en";
  className?: string;
};

export function HeroAnimatedVisual({ chips, localeLabel, className }: HeroAnimatedVisualProps) {
  const ariaLabel = localeLabel === "zh" ? "结构化测评可视化面板" : "Structured assessment visual panel";

  return (
    <div className={cn("relative mx-auto flex w-full max-w-[34rem] items-center justify-center", className)}>
      <div className="fm-hero-panel fm-hero-float relative w-full overflow-hidden rounded-[1.6rem] border border-sky-200/85 bg-white/88 p-4 shadow-[var(--fm-shadow-lg)] backdrop-blur">
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox="0 0 700 430"
          className="h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fm-hero-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7fbff" />
              <stop offset="100%" stopColor="#e8f6fb" />
            </linearGradient>
            <linearGradient id="fm-hero-accent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1099cf" />
              <stop offset="100%" stopColor="#0f70b2" />
            </linearGradient>
            <linearGradient id="fm-hero-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          <rect x="8" y="8" width="684" height="414" rx="30" fill="url(#fm-hero-bg)" />

          <g className="fm-hero-drift-slow">
            <rect x="52" y="52" width="596" height="44" rx="14" fill="#d6eff5" />
            <circle cx="82" cy="74" r="7" fill="#1099cf" />
            <circle cx="106" cy="74" r="7" fill="#0d9488" />
            <circle cx="130" cy="74" r="7" fill="#f59e0b" />
          </g>

          <g className="fm-hero-drift">
            <rect x="96" y="122" width="338" height="178" rx="18" fill="#ffffff" stroke="#b6d4ec" strokeWidth="3" />
            <rect x="118" y="148" width="170" height="14" rx="7" fill="#d8e8f8" />
            <rect x="118" y="176" width="112" height="14" rx="7" fill="#d8e8f8" />
            <rect x="118" y="204" width="146" height="14" rx="7" fill="#d8e8f8" />
            <rect x="118" y="240" width="282" height="8" rx="4" fill="#e7f1fb" />
            <rect x="118" y="258" width="252" height="8" rx="4" fill="#e7f1fb" />
            <rect x="118" y="276" width="274" height="8" rx="4" fill="#e7f1fb" />

            <rect x="326" y="170" width="18" height="96" rx="5" fill="#d5e5f5" />
            <rect x="350" y="188" width="18" height="78" rx="5" fill="#9fc7ed" />
            <rect x="374" y="155" width="18" height="111" rx="5" fill="url(#fm-hero-accent)" />
          </g>

          <g className="fm-hero-drift-slow">
            <rect x="466" y="122" width="138" height="178" rx="18" fill="#ffffff" stroke="#b6d4ec" strokeWidth="3" />
            <circle cx="535" cy="178" r="46" fill="#ecf6ff" />
            <path d="M535 178 L535 132 A46 46 0 0 1 570 194 Z" fill="#f59e0b" />
            <path d="M535 178 L570 194 A46 46 0 0 1 503 212 Z" fill="#1099cf" />
            <rect x="492" y="246" width="84" height="10" rx="5" fill="#d8e8f8" />
            <rect x="504" y="266" width="64" height="10" rx="5" fill="#d8e8f8" />
          </g>

          <g className="fm-hero-bob">
            <circle cx="144" cy="352" r="24" fill="#f6c7a5" />
            <rect x="122" y="374" width="44" height="34" rx="14" fill="#0f70b2" />
            <rect x="112" y="406" width="24" height="14" rx="4" fill="#f59e0b" />
            <rect x="154" y="406" width="24" height="14" rx="4" fill="#f59e0b" />
          </g>

          <g className="fm-hero-bob">
            <circle cx="562" cy="352" r="24" fill="#f6c7a5" />
            <rect x="540" y="374" width="44" height="34" rx="14" fill="#0d9488" />
            <rect x="530" y="406" width="24" height="14" rx="4" fill="#f59e0b" />
            <rect x="572" y="406" width="24" height="14" rx="4" fill="#f59e0b" />
          </g>

          <rect x="286" y="310" width="126" height="18" rx="8" fill="url(#fm-hero-gold)" />
          <rect x="266" y="334" width="166" height="12" rx="6" fill="#1099cf" />
        </svg>
      </div>

      <div className="fm-hero-chip-stack absolute -bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col gap-2">
        {chips.slice(0, 3).map((chip, index) => (
          <span
            key={`${chip}-${index}`}
            className="rounded-md bg-[#0f97bf] px-4 py-[var(--fm-space-2)] text-sm font-semibold text-white shadow-[var(--fm-shadow-sm)]"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
