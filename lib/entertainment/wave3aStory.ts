import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeHonorCopy } from "@/lib/questionnaires/archetypeHonorCardCopy";
import type { archetypeCardThemes } from "@/lib/questionnaires/archetypeResultCard";
import type { resolveFunQuiz } from "./scoring";
import type { FunQuiz } from "./types";
import registration from "./wave3aStoryScope.json";

export type StoryHonorMode = "tally" | "branch";
type Theme = keyof typeof archetypeCardThemes;
type Target = "MBTI" | "BIG5_OCEAN" | "EQ_60" | "RIASEC";
export const wave3aStoryScope = registration as Readonly<Record<string, { theme: Theme; target: Target; mechanism: StoryHonorMode }>>;

export function wave3aStoryVariant(slug: string) {
  return Object.hasOwn(wave3aStoryScope, slug) ? wave3aStoryScope[slug] : undefined;
}

export function storyHonorRunnerUp(quiz: FunQuiz, result: ReturnType<typeof resolveFunQuiz>) {
  if (quiz.mechanism !== "tally" || !result.complete || result.resultIds.length !== 1) return;
  const top = result.resultIds[0];
  const next = quiz.results.filter(portrait => portrait.id !== top);
  const highestRemaining = Math.max(...next.map(portrait => result.scores[portrait.id]));
  if (highestRemaining <= 0 || highestRemaining >= result.scores[top]) return;
  const runners = next.filter(portrait => result.scores[portrait.id] === highestRemaining);
  if (runners.length === 1) return runners[0];
}

export const storyHonorLabels = {
  zh: { branch: "你走到的结局", tags: "故事心境标签", scan: (title: string) => `扫码玩「${title}」`, scanDetail: "费马测试 · 看看故事怎么走 · FermatMind.com", tied: "这轮的结局同分并列", tiedReading: {
    personalityTags: ["双向感", "看情境", "有层次"], soulVerdict: "你这轮给了不止一种结局同样的分量，几条方向都保留下来。",
  } },
  "zh-TW": { branch: "你走到的結局", tags: "故事心境標籤", scan: (title: string) => `掃碼玩「${title}」`, scanDetail: "費馬測試 · 看看故事怎麼走 · FermatMind.com", tied: "這次的結局同分並列", tiedReading: {
    personalityTags: ["雙向感", "看情境", "有層次"], soulVerdict: "你這次給了不只一種結局同樣的分量，幾條方向都保留下來。",
  } },
  en: { branch: "Your Story Ending", tags: "Story mood tags", scan: (title: string) => `Scan to play ${title}`, scanDetail: "Find Your Ending · FermatMind.com", tied: "These endings share the top score", tiedReading: {
    personalityTags: ["Two Ways", "Context-Aware", "Mixed Signals"], soulVerdict: "You gave more than one ending the same weight, so all the leaders stay in the story.",
  } },
} as const satisfies Record<DisplayLocale, { branch: string; tags: string; scan: (title: string) => string; scanDetail: string; tied: string; tiedReading: ArchetypeHonorCopy }>;

export function storySharePayload(locale: DisplayLocale, title: string, names: string[], mode: StoryHonorMode, url: string) {
  const match = names.join(" · ");
  const branch = mode === "branch";
  const tied = names.length > 1;
  const text = {
    zh: branch ? `刚玩完「${title}」，我一路走到了「${match}」。换你选，会走到哪儿？`
      : tied ? `刚玩了「${title}」，「${match}」竟然同分。想看看你会选出什么。`
      : `刚玩了「${title}」，我的结局是「${match}」。好奇你的版本会怎么写。`,
    "zh-TW": branch ? `剛玩完「${title}」，我一路走到「${match}」。換你選，會走到哪個結局？`
      : tied ? `剛玩了「${title}」，「${match}」居然同分。好奇你的版本會怎麼走。`
      : `剛玩了「${title}」，我的結局是「${match}」。換你玩看看會走到哪裡。`,
    en: branch ? `I played ${title} and found my way to ${match}. Where would your choices take you?`
      : tied ? `I got a tie on ${title}: ${match}. Curious which ending you’d get.`
      : `I played ${title} and got ${match}. I’m curious how your story would end.`,
  }[locale];
  return { title: `${title} · ${match}`, text, url };
}
