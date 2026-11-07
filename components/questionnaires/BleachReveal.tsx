import { BleachChoiceContext } from "./BleachChoiceContext";
import { BleachCharacterDirectory } from "./BleachCharacterDirectory";
import Image from "next/image";
import Link from "next/link";
import { bleachPresentation, bleachPortraitPath } from "@/lib/questionnaires/bleachPresentation";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import { BleachShareCard } from "./BleachShareCard";

export function BleachReveal({ quiz, result, locale, answers }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale; answers?: QuestionnaireAnswers }) {
  const zh = locale === "zh";
  const profiles = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
  return <><section data-bleach-reveal className="my-6 space-y-5 rounded-xl border border-slate-300 bg-white p-5 sm:p-7" aria-label={zh ? "你的BLEACH角色结果" : "Your BLEACH character reveal"}>
    <p className="text-sm font-semibold text-slate-600">{zh ? "你匹配哪位《死神》角色？" : "Which BLEACH character are you?"}</p>
    <h3 className="text-3xl font-semibold leading-tight">{profiles.map(profile => bleachPresentation(profile.id)!.name[locale]).join(zh ? "、" : " · ")}</h3>
    <p className="leading-7">{profiles.length === 1 ? (zh ? "这是你本次21题中选择最多的角色方向。" : "This is the character direction you chose most often in these 21 questions.") : (zh ? `${profiles.length}位角色共同最高，全部保留；顺序不代表主次。` : `All ${profiles.length} characters share the highest count. Every tie is kept, with no priority implied.`)}</p>
    <a href="#bleach-character-directory" className="inline-flex min-h-11 items-center font-semibold underline">{zh ? "比较全部七位角色" : "Compare all seven characters"}</a>
    <ul className={profiles.length > 1 ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>{profiles.map(profile => {
      const person = bleachPresentation(profile.id)!;
      const direction = quiz.directions.find(d => profile.directionIds.includes(d.id))!;
      return <li key={profile.id} className="rounded-lg border border-slate-200 p-4" style={{ borderTop: `4px solid ${person.accent}` }}>
        <div className="flex items-center gap-4">
          <Image unoptimized src={bleachPortraitPath(profile.id)} width={104} height={120} alt={zh ? `${person.name.zh}的原创同人人物意象` : `Original fan portrait of ${person.name.en}`} className="h-28 w-auto shrink-0 rounded-lg" />
          <div><a className="inline-flex min-h-11 items-center font-semibold underline" href={`#animal-title-${profile.id}`}>{person.name[locale]}</a><p className="my-2 text-lg font-semibold leading-7">{person.conclusion[locale]}</p></div>
        </div>
        <BleachChoiceContext quiz={quiz} profile={profile} answers={answers} locale={locale} expanded={profiles.length === 1} />
        <p className="my-2 text-sm leading-6">{zh ? "本次选中" : "Chosen this time"} {result.counts[direction.id]} / {direction.comparisons} · {zh ? "选项出现次数" : "option appearances"}</p>
        <Link prefetch={false} className="inline-flex min-h-11 items-center underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读公开人物指南" : "Read public character guide"}</Link>
      </li>;
    })}</ul>
    <p className="text-sm leading-7 text-slate-600">{zh ? "这是把日常选择与七位角色联系起来的非官方趣味读法。次数不是相似度、战力或人格能力分；下方保留全部计数和完整说明。人物图为本站原创同人意象。" : "An unofficial fan reading connecting everyday choices with seven characters. Counts are not resemblance percentages, power levels or personality ability scores. All counts and full explanations follow. Portraits are original fan illustrations."}</p>
    <BleachShareCard ids={result.profileIds} locale={locale} />
  </section><BleachCharacterDirectory quiz={quiz} locale={locale} /></>;
}
