import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";

const HUD_CALLOUTS = [
  {
    label: { zh: "人格核心维度", en: "Personality core" },
    value: "28+",
    top: "11.5%",
  },
  {
    label: { zh: "潜在能力因子", en: "Potential ability" },
    value: "48+",
    top: "25.5%",
  },
  {
    label: { zh: "性格倾向因子", en: "Trait tendency" },
    value: "32+",
    top: "39%",
  },
  {
    label: { zh: "职业匹配因子", en: "Career matching" },
    value: "120+",
    top: "54.5%",
  },
  {
    label: { zh: "沟通与关系因子", en: "Communication factors" },
    value: "18+",
    top: "69%",
  },
  {
    label: { zh: "数据标注维度", en: "Data labels" },
    value: "200+",
    top: "84.5%",
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
        src="/images/home/hero-assessment-hud.png?v=restored-brain-rings"
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
      <div className="absolute inset-0">
        {HUD_CALLOUTS.map((item) => (
          <div
            key={item.value}
            className="absolute right-[3%] w-[9.5rem] text-left text-[0.8rem] font-bold leading-tight text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.35)]"
            style={{ top: item.top }}
          >
            <span aria-hidden className="absolute right-full top-[0.7rem] mr-3 h-px w-20 bg-lime-300/72">
              <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-lime-300 shadow-[0_0_8px_rgba(190,242,100,0.75)]" />
            </span>
            <span className="block whitespace-nowrap">{item.label[language]}</span>
            <span className="mt-1 block text-[0.92rem] text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
