import { StartTestButton } from "@/components/tests/StartTestButton";
import type { FunQuiz } from "@/lib/entertainment/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function StoryTakeEntry({ quiz, locale, landingInstructions, compactLanding = false, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; compactLanding?: boolean; displayLocale?: DisplayLocale; landingInstructions?: { en: string; zh: string } }) {
  return <div id="play" className="my-6 space-y-4" data-story-take-entry>
    <StartTestButton href={`/${displayLocale}/tests/play/${quiz.slug}/take?start=1`}>
      {displayLocale === "zh-TW" ? "開始測驗" : locale === "zh" ? "开始测试" : "Start quiz"}<span aria-hidden="true">→</span>
    </StartTestButton>
    {compactLanding && <h2 className="mt-6 border-t border-teal-100 pt-5 text-sm font-semibold">{quiz.mechanism === "branch" ? (displayLocale === "zh-TW" ? "短篇分支故事的閱讀說明" : locale === "zh" ? "短篇分支故事的阅读说明" : "Reading a short branching story") : (displayLocale === "zh-TW" ? "六個想像情境的作答說明" : locale === "zh" ? "六个想象场景的作答说明" : "Answering six imagined scenes")}</h2>}
    {landingInstructions && <p className="text-sm leading-7 text-slate-600">{landingInstructions[locale]}</p>}
  </div>;
}
