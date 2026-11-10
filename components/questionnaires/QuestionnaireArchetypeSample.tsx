import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { ChiikawaPortrait } from "./ChiikawaPortrait";
import { EdgerunnersPortrait } from "./EdgerunnersPortrait";
import { QuestionnaireArchetypeChoiceChart } from "./QuestionnaireArchetypeChoiceChart";

export function QuestionnaireArchetypeSample({ quiz, result, locale, sampleId, copy = value => value, displayLocale = locale }: {
  quiz: Questionnaire;
  result: Extract<ArchetypeResult, { status: "complete" }>;
  locale: Locale;
  sampleId: string;
  copy?: (text: string) => string;
  displayLocale?: DisplayLocale;
}) {
  const zh = locale === "zh";
  const chiikawa = quiz.slug === "chiikawa";
  const Portrait = chiikawa ? ChiikawaPortrait : EdgerunnersPortrait;
  const matched = result.profileIds.map(id => quiz.profiles.find(profile => profile.id === id)!);
  const placement = matched.length === 1 ? "between" : "before";
  return <div className="space-y-4">
    <ul className="space-y-2">
      {matched.map(profile => <li key={profile.id}>
        <Link prefetch={false} href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)} className="flex min-h-11 items-center gap-3 font-semibold underline underline-offset-4">
          <Portrait id={profile.id} className="size-12 shrink-0 rounded-lg" />
          {profile.title[locale]}
        </Link>
      </li>)}
    </ul>
    <details>
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{chiikawa ? (zh ? copy("查看全部选择次数") : "See all choice counts") : (zh ? copy("查看七项选择次数") : "See all seven choice counts")}</summary>
      <QuestionnaireArchetypeChoiceChart quiz={quiz} result={result} locale={locale} copy={copy} sampleId={sampleId} placement={placement} />
    </details>
  </div>;
}
