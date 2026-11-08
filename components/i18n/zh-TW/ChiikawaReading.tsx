import { ChiikawaPortrait } from "@/components/questionnaires/ChiikawaPortrait";
import type { traditionalQuiz } from "@/lib/i18n/zh-TW/chiikawa";

export function ChiikawaReading({ profile, level = 2 }: { profile: typeof traditionalQuiz.profiles[number]; level?: 1 | 2 }) {
  const Title = level === 1 ? "h1" : "h2";
  const SectionTitle = level === 1 ? "h2" : "h3";
  return <article data-match={profile.id} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
    <div className="flex items-center gap-5"><ChiikawaPortrait id={profile.id} className="size-24 shrink-0 rounded-xl" /><Title className="text-2xl font-bold">{profile.title["zh-TW"]}</Title></div>
    <p className="text-lg leading-8">{profile.headline["zh-TW"]}</p><p className="whitespace-pre-line leading-8">{profile.summary["zh-TW"]}</p>
    <p className="whitespace-pre-line leading-8">{profile.scoreReading["zh-TW"]}</p>
    {profile.sections.map(section => <section key={section.id} className="space-y-3"><SectionTitle className="text-xl font-semibold">{section.title["zh-TW"]}</SectionTitle>{section.paragraphs.map((text, index) => <p key={index} className="whitespace-pre-line leading-8">{text["zh-TW"]}</p>)}</section>)}
  </article>;
}
