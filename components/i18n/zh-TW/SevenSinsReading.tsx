import { sevenSinsChineseGuideProfile } from "@/lib/questionnaires/sevenSinsChineseSeo";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import type { traditionalSevenSins } from "@/lib/i18n/zh-TW/sevenSins";

export function SevenSinsReading({ profile, level = 2 }: { profile: typeof traditionalSevenSins.profiles[number]; level?: 1 | 2 }) {
  const display = sevenSinsChineseGuideProfile("seven-sins-virtues-test", "zh", profile);
  const Heading = level === 1 ? "h1" : "h2";
  return <article className="space-y-6"><Heading className="text-3xl font-bold">{level === 1 ? sevenSinsDisplay(display.title.zh, "zh-TW") : profile.title["zh-TW"]}</Heading>
    <p className="text-xl leading-8">{profile.headline["zh-TW"]}</p><p className="leading-8">{level === 1 ? sevenSinsDisplay(display.summary.zh, "zh-TW") : profile.summary["zh-TW"]}</p><p className="leading-8">{profile.scoreReading["zh-TW"]}</p>
    {profile.sections.map(section => <section key={section.id} className="space-y-3"><h3 className="text-xl font-semibold">{section.title["zh-TW"]}</h3>{section.paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-line leading-8">{paragraph["zh-TW"]}</p>)}</section>)}
  </article>;
}
