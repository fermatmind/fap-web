import { cn } from "@/lib/utils";

type HeroAnimatedVisualProps = {
  chips: string[];
  localeLabel: "zh" | "en";
  className?: string;
};

export function HeroAnimatedVisual({ chips, localeLabel, className }: HeroAnimatedVisualProps) {
  const ariaLabel = localeLabel === "zh" ? "抽象科学测评视觉装置" : "Abstract scientific assessment artifact";

  return (
    <div className={cn("relative mx-auto flex w-full max-w-[42rem] items-center justify-center", className)}>
      <div aria-hidden className="fm-home-orbit-glow fm-home-orbit-glow--one" />
      <div aria-hidden className="fm-home-orbit-glow fm-home-orbit-glow--two" />

      <div className="fm-home-visual-frame relative w-full overflow-hidden rounded-[2rem] border border-white/65 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(235,244,255,0.82))] p-4 shadow-[var(--fm-shadow-lg)] backdrop-blur md:p-5">
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox="0 0 760 620"
          className="h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fm-home-visual-surface" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbfdff" />
              <stop offset="100%" stopColor="#eef4ff" />
            </linearGradient>
            <linearGradient id="fm-home-axis" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1f70cc" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="fm-home-signal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d8ecff" />
            </linearGradient>
            <radialGradient id="fm-home-core" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#d8ebff" />
              <stop offset="100%" stopColor="#a6c7f0" />
            </radialGradient>
            <radialGradient id="fm-home-core-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(21,63,131,0.42)" />
              <stop offset="100%" stopColor="rgba(21,63,131,0)" />
            </radialGradient>
          </defs>

          <rect x="10" y="10" width="740" height="600" rx="42" fill="url(#fm-home-visual-surface)" />

          <g opacity="0.92">
            <path
              d="M88 156C170 88 274 50 380 50C494 50 602 94 674 164"
              fill="none"
              stroke="#d4e2f5"
              strokeWidth="2"
              strokeDasharray="6 10"
            />
            <path
              d="M112 494C190 550 284 580 380 580C478 580 584 546 660 482"
              fill="none"
              stroke="#d4e2f5"
              strokeWidth="2"
              strokeDasharray="6 10"
            />
          </g>

          <g className="fm-home-visual-slow-ring">
            <circle cx="380" cy="316" r="210" fill="none" stroke="#dbe7f7" strokeWidth="1.5" />
            <circle cx="380" cy="316" r="162" fill="none" stroke="#d7e8f9" strokeWidth="1.5" />
            <circle cx="380" cy="316" r="112" fill="none" stroke="#d9eef6" strokeWidth="1.5" />
          </g>

          <g className="fm-home-visual-orbit">
            <path
              d="M252 224C292 184 342 162 394 162C466 162 532 202 564 262"
              fill="none"
              stroke="url(#fm-home-axis)"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.18"
            />
            <path
              d="M230 382C276 450 350 490 428 490C492 490 554 462 596 412"
              fill="none"
              stroke="url(#fm-home-axis)"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.16"
            />
            <circle cx="268" cy="224" r="18" fill="#ffffff" stroke="#9ec6ef" strokeWidth="8" />
            <circle cx="562" cy="260" r="16" fill="#ffffff" stroke="#9fd8cf" strokeWidth="8" />
            <circle cx="594" cy="410" r="18" fill="#ffffff" stroke="#f2b37a" strokeWidth="8" />
          </g>

          <g opacity="0.9">
            <line x1="380" y1="104" x2="380" y2="530" stroke="#d7e5f3" strokeWidth="1.5" />
            <line x1="166" y1="316" x2="594" y2="316" stroke="#d7e5f3" strokeWidth="1.5" />
          </g>

          <g className="fm-home-visual-core">
            <circle cx="380" cy="316" r="94" fill="url(#fm-home-core-aura)" />
            <circle cx="380" cy="316" r="80" fill="url(#fm-home-core)" />
            <circle cx="380" cy="316" r="54" fill="#ffffff" opacity="0.95" />
            <path
              d="M380 220C407 220 432 228 454 243"
              fill="none"
              stroke="#1f70cc"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d="M462 282C468 304 468 330 462 352"
              fill="none"
              stroke="#0d9488"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.34"
            />
            <path
              d="M440 392C421 408 398 418 372 420"
              fill="none"
              stroke="#ea580c"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.32"
            />
          </g>

          <g className="fm-home-visual-float">
            <rect x="118" y="112" width="150" height="88" rx="24" fill="#ffffff" opacity="0.92" />
            <path d="M144 154H232" stroke="#d9e8f8" strokeWidth="12" strokeLinecap="round" />
            <path d="M144 178H208" stroke="#d9e8f8" strokeWidth="12" strokeLinecap="round" />
            <path d="M144 134H180" stroke="url(#fm-home-axis)" strokeWidth="12" strokeLinecap="round" />
          </g>

          <g className="fm-home-visual-float-delayed">
            <rect x="518" y="104" width="116" height="110" rx="26" fill="#ffffff" opacity="0.92" />
            <circle cx="576" cy="144" r="24" fill="url(#fm-home-signal)" />
            <path d="M552 188H602" stroke="#d9e8f8" strokeWidth="12" strokeLinecap="round" />
          </g>

          <g className="fm-home-visual-float">
            <rect x="114" y="426" width="176" height="78" rx="26" fill="#ffffff" opacity="0.92" />
            <path d="M146 454L178 442L208 466L250 438" fill="none" stroke="url(#fm-home-axis)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M146 484H246" stroke="#d9e8f8" strokeWidth="12" strokeLinecap="round" />
          </g>

          <g className="fm-home-visual-float-delayed">
            <rect x="486" y="434" width="150" height="84" rx="28" fill="#ffffff" opacity="0.92" />
            <path d="M516 470H606" stroke="#d9e8f8" strokeWidth="12" strokeLinecap="round" />
            <path d="M516 494H580" stroke="#d9e8f8" strokeWidth="12" strokeLinecap="round" />
            <circle cx="598" cy="476" r="16" fill="#e7f2fd" />
          </g>
        </svg>
      </div>

      {chips.slice(0, 3).map((chip, index) => (
        <span
          key={`${chip}-${index}`}
          className={cn(
            "fm-home-visual-chip",
            index === 0 && "fm-home-visual-chip--one",
            index === 1 && "fm-home-visual-chip--two",
            index === 2 && "fm-home-visual-chip--three"
          )}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
