import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { bleachDirectionNote } from "./BleachLandingEditorial";

export function bleachChoiceEvidence(quiz: Questionnaire, profile: QuestionnaireProfile, answers: QuestionnaireAnswers) {
  return quiz.questions.flatMap((question, index) => {
    const option = question.options.find(value => value.id === answers[question.id] && profile.directionIds.includes(value.directionId));
    return option ? [{ number: index + 1, question, option }] : [];
  });
}

export function BleachChoiceContext({ quiz, profile, answers, locale, expanded, copy = value => value }: {
  quiz: Questionnaire; profile: QuestionnaireProfile; answers?: QuestionnaireAnswers; locale: Locale; expanded: boolean; copy?: (text: string) => string;
}) {
  if (!answers) return null;
  const evidence = bleachChoiceEvidence(quiz, profile, answers);
  if (!evidence.length) return null;
  const zh = locale === "zh";
  const mapping = bleachDirectionNote(profile.id, locale);
  if (!mapping) return null;
  const items = (rows: typeof evidence) => <ol className="space-y-4" data-bleach-choice-reasons>{rows.map(({ number, question, option }) => <li key={question.id} data-bleach-question-number={number} className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm leading-7">
    <p className="font-semibold">{zh ? copy(`第${number} / ${quiz.questions.length}题`) : `Question ${number} of ${quiz.questions.length}`} · {question.prompt[locale]}</p>
    <p><span className="font-semibold">{zh ? copy("你选择了：") : "You chose: "}</span>{option.label[locale]}</p>
    <p className="text-slate-600"><span className="font-semibold">{zh ? copy("本版对应：") : "Edition mapping: "}</span>{zh ? copy(`这个选项关注“${mapping}”，因此计入这一角色方向。`) : `This option concerns ${mapping}, so it adds one to this character direction.`}</p>
  </li>)}</ol>;
  return <section data-bleach-choice-context className="my-4 space-y-3">
    <p className="font-semibold">{zh ? copy("为什么得到这个方向？看本次选择") : "Why this direction? See your actual choices"}</p>
    <p className="text-sm leading-7 text-slate-600">{zh ? copy(`本次有${evidence.length}项选择计入这一方向。以下展示原题和原选项；对应说明解释本版规则，不推断你的现实能力。`) : `${evidence.length} of your choices count toward this direction. These are the original scenarios and selected options; the mapping notes explain this edition’s rules, not your real-world abilities.`}</p>
    {expanded ? <>
      {items(evidence.slice(0, 2))}
      {evidence.length > 2 && <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{zh ? copy(`查看其余${evidence.length - 2}项选择依据`) : `See the other ${evidence.length - 2} supporting choices`}</summary>{items(evidence.slice(2))}</details>}
    </> : <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{zh ? copy(`展开${evidence.length}项原题与选择依据`) : `Expand ${evidence.length} original scenarios and choices`}</summary>{items(evidence)}</details>}
  </section>;
}
