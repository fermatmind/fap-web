import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { findPublicPortrait, portraitDescription } from "@/lib/entertainment/guides";
import { loadTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStories";

let font: Promise<ArrayBuffer> | undefined;

export async function traditionalStoryCard(slug: string, portrait: string | null) {
  const story = await loadTraditionalLegacyStory(slug);
  const result = story && portrait ? findPublicPortrait(story.quiz, portrait) : undefined;
  if (!story || (portrait && !result)) return new Response("Image unavailable", { status: 404 });
  font ??= readFile(path.join(process.cwd(), "public/fonts/noto-sans-tc/legacy-story-700.ttf"))
    .then((bytes) => Uint8Array.from(bytes).buffer);

  const title = result?.title.zh ?? story.quiz.title.zh;
  const description = result ? portraitDescription(result, "zh") : story.quiz.seo.description.zh;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#f8fafc", color: "#0f172a", fontFamily: "StoryNoto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#0f766e", fontSize: 29 }}>
        <span>費馬測試</span><span>{result ? "公開結果指南" : "原創故事測驗"}</span>
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
      fonts: [{ name: "StoryNoto", data: await font, weight: 700, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400", "X-Robots-Tag": "noindex" },
    },
  );
}
