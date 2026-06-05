import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";

const HUD_WIDTH = 687;
const HUD_HEIGHT = 528;

const HUD_CALLOUTS = [
  {
    label: { zh: "人格核心维度", en: "Personality core" },
    value: "28+",
    labelBox: { x: 541, y: 43, width: 110 },
  },
  {
    label: { zh: "潜在能力因子", en: "Potential ability" },
    value: "48+",
    labelBox: { x: 541, y: 114, width: 110 },
  },
  {
    label: { zh: "性格倾向因子", en: "Trait tendency" },
    value: "32+",
    labelBox: { x: 541, y: 184, width: 110 },
  },
  {
    label: { zh: "职业匹配因子", en: "Career matching" },
    value: "120+",
    labelBox: { x: 541, y: 254, width: 110 },
  },
  {
    label: { zh: "沟通与关系因子", en: "Communication factors" },
    value: "18+",
    labelBox: { x: 541, y: 326, width: 128 },
  },
  {
    label: { zh: "数据标注维度", en: "Data labels" },
    value: "200+",
    labelBox: { x: 541, y: 400, width: 110 },
  },
] as const;

export function HeroHudArtwork({ locale }: { locale: Locale }) {
  const language = locale === "zh" ? "zh" : "en";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative ml-6 mt-[7px] hidden aspect-[687/528] w-[46.2vw] self-start overflow-visible lg:block xl:ml-[163.5px] xl:mt-[calc(4.842vw-53px)] xl:w-[46.2vw]"
    >
      <Image
        src="/images/home/hero-assessment-hud.png?v=redcircle-visual-x800-v1"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1280px) 47vw, 50vw"
        className="object-contain object-right opacity-100"
      />
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
