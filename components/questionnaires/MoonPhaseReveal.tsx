import Image from "next/image";
import Link from "next/link";
import { moonPhasePresentation, moonPhaseImage, moonPhaseDiagramNote } from "@/lib/questionnaires/moonPhasePresentation";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import { MoonPhaseShareCard } from "./MoonPhaseShareCard";

export function MoonPhaseReveal({ quiz, result, locale, answers }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale; answers?: QuestionnaireAnswers }) {
  const zh = locale === "zh";
  const profiles = quiz.profiles.filter(p => result.profileIds.includes(p.id));
  return <section data-moon-phase-reveal className="my-6 space-y-5 rounded-xl border border-slate-300 bg-slate-950 p-5 text-slate-100 sm:p-7" aria-label={zh ? "你的月相揭晓" : "Your moon phase reveal"}>
    <p className="text-sm font-semibold text-amber-200">{zh ? "你是哪种月相？" : "What moon phase are you?"}</p>
    <h3 className="text-3xl font-semibold leading-tight">{profiles.map(p => moonPhasePresentation(p.id)!.name[locale]).join(zh ? "、" : " · ")}</h3>
    <p className="leading-7">{profiles.length === 1 ? (zh ? "这是本次24道情境题中，你选择最多的活动节奏意象。" : "This activity-pace metaphor received the most choices in your 24 scenarios.") : zh ? `${profiles.length}种意象共同最高，全部保留；顺序不代表主次。` : `All ${profiles.length} metaphors share the highest count. Every tie is kept, with no priority implied.`}</p>
    <ul className="grid gap-5 sm:grid-cols-2">{profiles.map(profile => {
      const phase = moonPhasePresentation(profile.id)!;
      const direction = quiz.directions.find(d => profile.directionIds.includes(d.id))!;
      const reasons = answers ? quiz.questions.flatMap((question, index) => {
        const option = question.options.find(o => o.id === answers[question.id] && profile.directionIds.includes(o.directionId));
        return option ? [{ question, option, number: index + 1 }] : [];
      }).slice(0, 2) : [];
      return <li key={profile.id} className="rounded-xl border border-slate-600 p-4">
        <Image unoptimized src={moonPhaseImage(profile.id)} width={160} height={160} alt={zh ? `${phase.name.zh}月相示意图` : `${phase.name.en} phase diagram`} className="mb-3 size-32 rounded-xl" />
        <a href={`#animal-title-${profile.id}`} className="inline-flex min-h-11 items-center text-xl font-semibold underline">{phase.name[locale]}</a>
        <p className="my-2 text-lg font-semibold leading-7 text-amber-200">{phase.conclusion[locale]}</p>
        {reasons.length > 0 && <details open={profiles.length === 1} className="my-3 text-sm leading-6"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "这次结果来自这些选择" : "Choices behind this match"}</summary><ul className="space-y-3" data-moon-phase-choice-reasons>{reasons.map(({ question, option, number }) => <li key={question.id}>
          <p className="text-slate-300">{zh ? `第${number}题：` : `Question ${number}: `}{question.prompt[locale]}</p><p><strong>{zh ? "你选择了：" : "You chose: "}</strong>{option.label[locale]}</p>
        </li>)}</ul></details>}
        <p className="my-2 text-sm leading-6">{zh ? `本次选中${result.counts[direction.id]}次 · 共出现${direction.comparisons}次` : `Chosen ${result.counts[direction.id]} times · offered ${direction.comparisons} times`}</p>
        <Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)} className="inline-flex min-h-11 items-center underline">{zh ? "阅读这一月相的完整指南" : "Read this phase’s complete guide"}</Link>
      </li>;
    })}</ul>
    <p className="text-sm leading-7 text-slate-300">{zh ? "次数只描述这次选择，不是人格相似度或天文测量。" : "Counts describe this attempt, not personality similarity or an astronomical measurement."} {moonPhaseDiagramNote[locale]}</p>
    <div className="text-slate-950"><MoonPhaseShareCard ids={result.profileIds} locale={locale} /></div>
  </section>;
}
