import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";

const HUD_WIDTH = 647;
const HUD_HEIGHT = 520;

const HUD_CALLOUTS = [
  {
    label: { zh: "人格核心维度", en: "Personality core" },
    value: "28+",
    labelBox: { x: 501, y: 44, width: 92 },
    line: "401 111 426 84 455 58 487 58",
    dot: [487, 58],
  },
  {
    label: { zh: "潜在能力因子", en: "Potential ability" },
    value: "48+",
    labelBox: { x: 501, y: 115, width: 92 },
    line: "439 145 458 129 487 129",
    dot: [487, 129],
  },
  {
    label: { zh: "性格倾向因子", en: "Trait tendency" },
    value: "32+",
    labelBox: { x: 501, y: 185, width: 92 },
    line: "396 258 417 240 458 199 487 199",
    dot: [487, 199],
  },
  {
    label: { zh: "职业匹配因子", en: "Career matching" },
    value: "120+",
    labelBox: { x: 501, y: 255, width: 92 },
    line: "354 370 398 324 455 269 487 269",
    dot: [487, 269],
  },
  {
    label: { zh: "沟通与关系因子", en: "Communication factors" },
    value: "18+",
    labelBox: { x: 501, y: 327, width: 110 },
    line: "389 374 416 357 456 341 487 341",
    dot: [487, 341],
  },
  {
    label: { zh: "数据标注维度", en: "Data labels" },
    value: "200+",
    labelBox: { x: 501, y: 401, width: 92 },
    line: "342 415 455 415 487 415",
    dot: [487, 415],
  },
] as const;

export function HeroHudArtwork({ locale }: { locale: Locale }) {
  const language = locale === "zh" ? "zh" : "en";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative ml-6 mt-[7px] hidden aspect-[647/520] w-[43.51vw] self-start overflow-visible lg:block xl:ml-[223.5px] xl:mt-[calc(4.842vw-47px)] xl:w-[43.51vw]"
    >
      <Image
        src="/images/home/hero-assessment-hud.png?v=opaque-x840-v1"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1280px) 44vw, 48vw"
        className="object-contain object-right opacity-100"
      />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${HUD_WIDTH} ${HUD_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {HUD_CALLOUTS.map((item) => (
            <g key={`line-${item.value}`}>
              <polyline
                points={item.line}
                stroke="#b8d85a"
                strokeOpacity="0.1"
                strokeWidth="1.9"
              />
              <polyline
                points={item.line}
                stroke="#a6c447"
                strokeOpacity="0.48"
                strokeWidth="0.84"
              />
            </g>
          ))}
        </g>
        {HUD_CALLOUTS.map((item) => (
          <g key={`dot-${item.value}`}>
            <circle cx={item.dot[0]} cy={item.dot[1]} r="4.7" fill="rgba(190,242,100,0.11)" />
            <circle
              cx={item.dot[0]}
              cy={item.dot[1]}
              r="2.65"
              fill="#d9ff5f"
              opacity="0.95"
            />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0">
        {HUD_CALLOUTS.map((item) => (
          <div
            key={item.value}
            className="absolute text-left text-[12px] font-bold leading-[13px] text-white"
            style={{
              left: `${(item.labelBox.x / HUD_WIDTH) * 100}%`,
              top: `${(item.labelBox.y / HUD_HEIGHT) * 100}%`,
              width: `${(item.labelBox.width / HUD_WIDTH) * 100}%`,
              textShadow:
                "0 0 2px rgba(255,255,255,0.24), 0 0 6px rgba(255,255,255,0.1)",
            }}
          >
            <span className="block whitespace-nowrap">{item.label[language]}</span>
            <span className="mt-[8px] block text-[13px] leading-[14px] text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
