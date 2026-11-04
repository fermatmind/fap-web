import { StartTestButton } from "@/components/tests/StartTestButton";
import type { FunQuiz } from "@/lib/entertainment/types";
import type { Locale } from "@/lib/i18n/locales";

export function StoryTakeEntry({ quiz, locale, landingInstructions, compactLanding = false }: { quiz: FunQuiz; locale: Locale; compactLanding?: boolean; landingInstructions?: { en: string; zh: string } }) {
  return <div id="play" className="my-6 space-y-4" data-story-take-entry>
    <StartTestButton href={`/${locale}/tests/play/${quiz.slug}/take?start=1`}>
      {locale === "zh" ? "开始测试" : "Start quiz"}<span aria-hidden="true">→</span>
    </StartTestButton>
    {compactLanding && <h2 className="mt-6 border-t border-teal-100 pt-5 text-sm font-semibold">{quiz.mechanism === "branch" ? (locale === "zh" ? "短篇分支故事的阅读说明" : "Reading a short branching story") : (locale === "zh" ? "六个想象场景的作答说明" : "Answering six imagined scenes")}</h2>}
    {landingInstructions && <p className="text-sm leading-7 text-slate-600">{landingInstructions[locale]}</p>}
  </div>;
}
