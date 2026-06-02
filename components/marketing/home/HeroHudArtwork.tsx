import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";

const HUD_CALLOUTS = [
  {
    label: { zh: "人格核心维度", en: "Personality core" },
    value: "28+",
    top: "9.8%",
    line: "600 116 688 63 721 63",
    dot: [721, 63],
  },
  {
    label: { zh: "潜在能力因子", en: "Potential ability" },
    value: "48+",
    top: "21.9%",
    line: "615 168 688 126 721 126",
    dot: [721, 126],
  },
  {
    label: { zh: "性格倾向因子", en: "Trait tendency" },
    value: "32+",
    top: "35%",
    line: "590 265 688 194 721 194",
    dot: [721, 194],
  },
  {
    label: { zh: "职业匹配因子", en: "Career matching" },
    value: "120+",
    top: "48.8%",
    line: "545 392 688 266 721 266",
    dot: [721, 266],
  },
  {
    label: { zh: "沟通与关系因子", en: "Communication factors" },
    value: "18+",
    top: "63.1%",
    line: "548 388 688 340 721 340",
    dot: [721, 340],
  },
  {
    label: { zh: "数据标注维度", en: "Data labels" },
    value: "200+",
    top: "76.9%",
    line: "622 412 721 412",
    dot: [721, 412],
  },
] as const;

export function HeroHudArtwork({ locale }: { locale: Locale }) {
  const language = locale === "zh" ? "zh" : "en";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative ml-6 mt-[7px] hidden aspect-[887/520] w-[calc(100%+0.625rem)] self-start overflow-visible [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.5)_4%,black_10%,black_88%,rgba(0,0,0,0.5)_96%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.5)_4%,black_10%,black_88%,rgba(0,0,0,0.5)_96%,transparent_100%)] lg:block xl:-ml-[39px] xl:mt-[calc(4.842vw-65px)] xl:w-[59.65vw]"
    >
      <Image
        src="/images/home/hero-assessment-hud.png?v=vector-callouts"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1280px) 56vw, 52vw"
        className="object-contain object-right opacity-100 mix-blend-screen brightness-110 contrast-110 [mask-image:linear-gradient(to_right,transparent_0%,transparent_12%,rgba(0,0,0,0.34)_24%,rgba(0,0,0,0.82)_34%,black_43%,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_12%,rgba(0,0,0,0.34)_24%,rgba(0,0,0,0.82)_34%,black_43%,black_100%)]"
      />
      <div className="absolute bottom-[5%] right-0 top-[4%] w-[28%] bg-[#0b1c24]/36 [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.68)_18%,black_36%,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.68)_18%,black_36%,black_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(86,111,126,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(86,111,126,0.18)_1px,transparent_1px)] bg-[size:28px_28px] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_47%,rgba(134,239,172,0.11),transparent_58%)]" />
      </div>
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 887 520"
        preserveAspectRatio="none"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {HUD_CALLOUTS.map((item) => (
            <polyline
              key={`line-${item.value}`}
              points={item.line}
              stroke="#a3e635"
              strokeOpacity="0.58"
              strokeWidth="1.15"
            />
          ))}
        </g>
        {HUD_CALLOUTS.map((item) => (
          <g key={`dot-${item.value}`}>
            <circle cx={item.dot[0]} cy={item.dot[1]} r="5.2" fill="rgba(190,242,100,0.16)" />
            <circle
              cx={item.dot[0]}
              cy={item.dot[1]}
              r="3.1"
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
            className="absolute right-[3%] w-[9.5rem] text-left text-[0.8rem] font-bold leading-tight text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.35)]"
            style={{ top: item.top }}
          >
            <span className="block whitespace-nowrap">{item.label[language]}</span>
            <span className="mt-1 block text-[0.92rem] text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
