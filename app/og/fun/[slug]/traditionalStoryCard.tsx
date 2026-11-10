import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { fantasyOpenGraphCard } from "@/lib/entertainment/fantasyCard";
import { findPublicPortrait, portraitDescription } from "@/lib/entertainment/guides";
import { traditionalPracticeRoute } from "@/lib/i18n/traditionalPracticePaths";
import { loadTraditionalPractice } from "@/lib/i18n/zh-TW/practiceQuestionnaires";
import { loadTraditionalArchetype } from "@/lib/i18n/zh-TW/archetypeQuestionnaires";
import { hasTraditionalArchetype } from "@/lib/i18n/traditionalArchetypePaths";
import { hasTraditionalBespokeStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import { loadTraditionalBespokeStory } from "@/lib/i18n/zh-TW/bespokeStories";
import { loadTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStories";

let font: Promise<ArrayBuffer> | undefined;
let archetypeFont: Promise<ArrayBuffer> | undefined;
let practiceFont: Promise<ArrayBuffer> | undefined;

export async function traditionalStoryCard(slug: string, portrait: string | null) {
  if (traditionalPracticeRoute(`/tests/explore/${slug}`)) {
    const item = await loadTraditionalPractice(slug);
    const result = item && portrait ? item.quiz.profiles.find(profile => profile.id === portrait) : undefined;
    if (!item || (portrait && !result)) return new Response("Image unavailable", { status: 404 });
    practiceFont ??= readFont("practice-questionnaire-700.ttf");
    return publicCard(result?.title.zh ?? item.quiz.title.zh, result?.summary.zh ?? item.quiz.description.zh, Boolean(result), await practiceFont, "原創練習題", "公開複習指南");
  }
  const archetype = hasTraditionalArchetype(slug);
  if (archetype) {
    const quiz = await loadTraditionalArchetype(slug);
    const result = quiz && portrait ? quiz.profiles.find(profile => profile.id === portrait) : undefined;
    if (!quiz || (portrait && !result)) return new Response("Image unavailable", { status: 404 });
    archetypeFont ??= readFont("archetype-questionnaire-700.ttf");
    if (slug === "avatar-bender-quiz" || slug === "soldier-poet-king-quiz") return fantasyOpenGraphCard(quiz, "zh", result?.id, await archetypeFont, true);
    return publicCard(result?.title.zh ?? quiz.title.zh, result?.summary.zh ?? quiz.description.zh, Boolean(result), await archetypeFont, "原創趣味測驗");
  }
  const quiz = hasTraditionalBespokeStory(slug) ? await loadTraditionalBespokeStory(slug) : (await loadTraditionalLegacyStory(slug))?.quiz;
  const result = quiz && portrait ? findPublicPortrait(quiz, portrait) : undefined;
  if (!quiz || (portrait && !result)) return new Response("Image unavailable", { status: 404 });
  font ??= readFont("legacy-story-700.ttf");
  return publicCard(result?.title.zh ?? quiz.title.zh, result ? portraitDescription(result, "zh") : quiz.seo.description.zh, Boolean(result), await font, "原創故事測驗");
}

function readFont(file: string) {
  return readFile(path.join(process.cwd(), "public/fonts/noto-sans-tc", file))
    .then(bytes => Uint8Array.from(bytes).buffer);
}

function publicCard(title: string, description: string, result: boolean, fontData: ArrayBuffer, label: string, guideLabel = "公開結果指南") {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#f8fafc", color: "#0f172a", fontFamily: "StoryNoto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#0f766e", fontSize: 29 }}>
        <span>費馬測試</span><span>{result ? guideLabel : label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ display: "flex", fontSize: title.length > 18 ? 54 : 66 }}>{title}</span>
        <span style={{ display: "flex", marginTop: 22, color: "#334155", fontSize: 30 }}>{description}</span>
      </div>
      <div style={{ display: "flex", color: "#0f766e", fontSize: 25 }}>fermatmind.com</div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "StoryNoto", data: fontData, weight: 700, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400", "X-Robots-Tag": "noindex" },
    },
  );
}
