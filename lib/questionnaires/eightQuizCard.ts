import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "./types";
import type { scoreQuestionnaire } from "./scoring";
import type { Sbti31Result } from "./sbti31";

export const eightQuizSlugs = new Set(["hogwarts-house-quiz", "love-languages", "hazbin-hotel-character-quiz", "hello-kitty", "love-type-16", "sbti-test", "spirit-animal", "moral-alignment"]);
export type EightQuizResult = ReturnType<typeof scoreQuestionnaire> | Sbti31Result;
export type PersonalCardRow = { id: string; title: string; detail: string; matched: boolean };
export const eightQuizScene: Record<string, string> = {
  "hogwarts-house-quiz": "/images/quiz-scenes/houses.webp",
  "hazbin-hotel-character-quiz": "/images/quiz-scenes/hotel.webp",
  "hello-kitty": "/images/quiz-scenes/friends.webp",
  "spirit-animal": "/images/quiz-scenes/animals.svg",
};

/** Only aggregate results are materialised. No answers, rarity or similarity claims enter a card. */
export function eightQuizCardRows(quiz: Questionnaire, result: EightQuizResult, locale: Locale): PersonalCardRow[] | null {
  if (!eightQuizSlugs.has(quiz.slug) || result.status !== "complete") return null;
  const zh = locale === "zh";
  if (quiz.slug === "love-languages" && "affectionFacets" in result) {
    const mean = (id: string) => { const facet = result.affectionFacets[id]; return facet?.mean == null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)}/5 (${facet.rated}/5)`; };
    return quiz.profiles.map(p => ({ id: p.id, title: p.title[locale], detail: `${zh ? "表达" : "Giving"}: ${mean(p.directionIds[0])} · ${zh ? "接收" : "Receiving"}: ${mean(p.directionIds[1])}`, matched: false }));
  }
  if (quiz.slug === "love-type-16" && "compatibleProfileIds" in result) {
    return result.loveType16.map(axis => ({ id: axis.id, title: axis.retained.map(id => id.toUpperCase()).join(" / "), detail: Object.entries(axis.counts).map(([id, count]) => `${quiz.directions.find(d => d.id === id)?.title[locale]} ${count}/8`).join(" · "), matched: true })).concat(result.compatibleProfileIds.map(id => ({ id, title: id.toUpperCase(), detail: quiz.profiles.find(p => p.id === id)!.title[locale], matched: true })));
  }
  if (quiz.slug === "sbti-test" && "profileCode" in result) {
    const profile = quiz.profiles.find(p => p.id === result.profileId);
    return profile ? [{ id: profile.id, title: `${result.profileCode} · ${profile.headline[locale]}`, detail: profile.summary[locale], matched: true }] : null;
  }
  if (quiz.slug === "moral-alignment" && "alignmentIds" in result) {
    return result.alignmentIds.map(id => ({ id, title: quiz.profiles.find(p => p.id === id)!.title[locale], detail: zh ? "本次匹配 · 保留全部边界" : "Matched here · All boundary matches retained", matched: true })).concat(quiz.directions.map(d => ({ id: d.id, title: d.title[locale], detail: `${result.counts[d.id]} / 12`, matched: false })));
  }
  if ("profileIds" in result && ["hogwarts-house-quiz", "hazbin-hotel-character-quiz", "hello-kitty", "spirit-animal"].includes(quiz.slug)) {
    return quiz.directions.map(d => ({ id: d.id, title: quiz.profiles.find(p => p.directionIds.includes(d.id))?.title[locale] ?? d.title[locale], detail: `${result.counts[d.id]} / ${d.comparisons}`, matched: result.profileIds.some(id => quiz.profiles.find(p => p.id === id)?.directionIds.includes(d.id)) }));
  }
  return null;
}
