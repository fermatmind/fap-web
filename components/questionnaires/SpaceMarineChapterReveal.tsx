"use client";

import Image from "next/image";
import Link from "next/link";
import { chapterHobbyLens, chapterPortraitPath, chapterChoiceReasons, chapterScope } from "@/lib/questionnaires/spaceMarineChapters";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";

export function SpaceMarineChapterReveal({ quiz, result, locale, answers }: {
  quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale; answers?: QuestionnaireAnswers;
}) {
  const zh = locale === "zh";
  const { traditional, displayText } = useQuestionnaireDisplayCopy();
  const displayLocale = traditional ? "zh-TW" : locale;
  const matched = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
  return <section data-space-marine-reveal className="my-6 space-y-5 rounded-xl border border-slate-300 bg-slate-50 p-5 sm:p-6" aria-label={zh ? displayText("本次战团结果") : "Your Chapter reveal"}>
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{zh ? displayText("非官方战团爱好读法") : "Unofficial Chapter hobby reading"}</p>
    <h3 className="text-2xl font-semibold leading-snug">{matched.map(profile => profile.title[locale]).join(zh ? displayText("、") : " · ")}</h3>
    <p className="leading-7">{matched.length === 1
      ? (zh ? displayText("这是你在本次18题中选得最多的战团视角。") : "This is the Chapter perspective you chose most often across these eighteen items.")
      : (zh ? displayText(`${matched.length}项共同最高，全部保留。可以分别读，没有额外的胜出者。`) : `All ${matched.length} Chapters share the highest count. Read each; there is no extra winner.`)}</p>
    <p className="text-sm leading-7 text-slate-600">{chapterScope[displayLocale]}</p>
    <ul className="grid gap-3 sm:grid-cols-2">{matched.map(profile => {
      const lens = chapterHobbyLens(profile.id);
      const reasons = chapterChoiceReasons(quiz, profile.directionIds[0], answers);
      return <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-4" style={{ borderTop: `4px solid ${lens?.color}` }}>
        <Image unoptimized src={chapterPortraitPath(profile.id)!} width={768} height={768} alt={zh ? displayText(`${profile.title.zh}的原创创作情境`) : `Original creative scene for ${profile.title.en}`} className="mb-4 h-auto w-full rounded-lg" />
        <a className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4" href={`#animal-title-${profile.id}`}>{profile.title[locale]}</a>
        <p className="leading-7">{lens ? displayText(lens[locale]) : undefined}</p>
        <p className="text-sm leading-6 text-slate-600">{zh ? displayText("本次选中") : "Chosen this time"} {result.counts[profile.directionIds[0]]} / 12</p>
        {reasons.length > 0 && <details className="my-4 space-y-3 border-t border-slate-200 pt-3" data-space-marine-reasons={profile.id}>
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("为什么得到这个战团视角？") : "Why this Chapter lens?"}</summary>
          <p className="text-sm leading-6">{zh ? displayText(`以下是你真正选中的场景。每项为“${lens?.zh}”加1次，它属于本次最高计数；这不是战团人格鉴定。`) : `These are scenes you actually chose. Each added one to “${lens?.en}”, one of this attempt’s highest counts; this is not a Chapter personality assessment.`}</p>
          <ol className="space-y-4 text-sm leading-7">{reasons.map(({number, question, option}) => <li key={question.id}>
            <p className="font-semibold">{zh ? displayText(`第${number}题场景：`) : `Item ${number} scene: `}{question.prompt[locale]}</p>
            <p>{zh ? displayText("你选择：") : "You chose: "}<q>{option.label[locale]}</q></p>
          </li>)}</ol>
        </details>}
        <Link prefetch={false} className="inline-flex min-h-11 items-center text-sm underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)} target="_blank" rel="noopener">{zh ? displayText("阅读公开指南（新标签页）") : "Read public guide (new tab)"}</Link>
      </li>;
    })}</ul>
    <p className="text-sm leading-6 text-slate-600">{zh ? displayText("次数来自这份题本中的选择，不是匹配百分比或官方归属。人物图为本站原创创作情境，并非官方角色或徽章。") : "Counts describe choices in this bank, not match percentages or official membership. The original character scenes are not official characters or insignia."}</p>

  </section>;
}
