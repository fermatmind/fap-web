import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { findPublicPortrait } from "@/lib/entertainment/guides";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";

let font: Promise<ArrayBuffer> | undefined;
const localFont = () => font ??= readFile(path.join(process.cwd(), "public/fonts/noto-sans-sc/fun-700.ttf")).then(bytes => Uint8Array.from(bytes).buffer);
const quizFonts = new Map<string, Promise<ArrayBuffer>>();
const quizFont = (trustedSlug: string) => {
  let selected = quizFonts.get(trustedSlug);
  if (!selected) {
    selected = readFile(path.join(process.cwd(), "public/fonts/noto-sans-sc", `${trustedSlug}-700.ttf`))
      .then(bytes => Uint8Array.from(bytes).buffer)
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") return localFont();
        throw error;
      });
    quizFonts.set(trustedSlug, selected);
  }
  return selected;
};
const colors: Record<string, string> = { nature: "#166534", fantasy: "#6d28d9", social: "#9a3412", everyday: "#155e75", relationships: "#9f1239", metaphor: "#3730a3" };

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = new URL(request.url).searchParams, locale = query.get("locale") ?? "en";
  if (locale !== "en" && locale !== "zh") return new Response("Image unavailable", { status: 404 });
  const questionnaire = await loadQuestionnaire(slug);
  const quiz = questionnaire ? null : await loadFunQuiz(slug);
  if (!quiz && !questionnaire) return new Response("Image unavailable", { status: 404 });
  const portrait = query.get("portrait");
  const result = portrait ? (quiz ? findPublicPortrait(quiz, portrait) : questionnaire?.profiles.find(profile => profile.id === portrait)) : undefined;
  if (portrait && !result) return new Response("Image unavailable", { status: 404 });
  const topic = quiz?.seo.topic[locale] ?? questionnaire!.title[locale];
  const title = result?.title[locale] ?? topic, zh = locale === "zh";
  const color = colors[quiz?.category ?? questionnaire?.category ?? "framework"] ?? colors.metaphor;
  const questionnaireLabel = result ? (zh ? "公开结果说明" : "Public result guide")
    : questionnaire?.slug === "grit-test" ? (zh ? "原创长期目标回顾" : "Original long-term-goal reflection")
    : questionnaire?.slug === "toxic-trait" ? (zh ? "原创互动习惯自我观察" : "Original interaction-habits reflection")
    : questionnaire?.slug === "intelligence-type-test" ? (zh ? "原创思考入口趣味版" : "Original thinking-approach quiz")
    : questionnaire?.slug === "locus-of-control" ? (zh ? "IPIP公有领域条目" : "Public-domain IPIP items")
    : questionnaire?.slug === "growth-mindset-fixed-mindset" ? (zh ? "原创学习信念自评" : "Original learning-belief reflection")
    : questionnaire?.slug === "maturity-test" ? (zh ? "原创成熟度自我观察" : "Original maturity self-reflection")
    : questionnaire?.kind === "compass" ? (zh ? "原创四向罗盘反思" : "Original four-direction compass reflection")
    : questionnaire?.slug === "inkblot-personality-quiz" ? (zh ? "原创墨迹视觉趣味" : "Original inkblot visual quiz")
    : questionnaire?.slug === "character-strengths" ? (zh ? "IPIP-VIA-R公有领域条目" : "Public-domain IPIP-VIA-R items")
    : questionnaire?.slug === "likable-person-test" ? (zh ? "自有互动选择自评" : "Original interaction reflection")
    : questionnaire?.slug === "people-pleaser" ? (zh ? "PPS条目自评" : "PPS item reflection")
    : questionnaire?.kind === "attachment" ? (zh ? "原创依恋情境自评" : "Original attachment reflection")
    : questionnaire?.kind === "affection" ? (zh ? "原创双向爱语自评" : "Original love-language reflection")
    : questionnaire?.slug === "aesthetic-core-test" ? (zh ? "原创视觉偏好自评" : "Original aesthetic reflection")
    : questionnaire?.slug === "travel-personality-test" ? (zh ? "原创旅行偏好自评" : "Original travel reflection")
    : questionnaire?.slug === "leadership-style" ? (zh ? "原创领导情境自评" : "Original leadership reflection")
    : questionnaire?.slug === "light-triad-test" ? (zh ? "发表LTS条目" : "Published LTS items")
    : questionnaire?.slug === "values" ? (zh ? "原创价值目标反思" : "Original value reflection")
    : questionnaire?.slug === "socionics" ? (zh ? "原创四组价值观察" : "Original quadra value reflection")
    : questionnaire?.slug === "temperament" ? (zh ? "原创古典气质自评" : "Original classical-style reflection")
    : (questionnaire?.kind === "extraversion" || questionnaire?.kind === "optimism") ? (zh ? "IPIP公有领域条目" : "Public-domain IPIP items")
    : questionnaire?.kind === "alignment" ? (zh ? "原创阵营问卷" : "Original alignment reflection")
    : questionnaire?.kind === "archetype" ? (zh ? "原创象征测验" : "Original symbolic quiz")
    : questionnaire?.kind === "likert" ? (zh ? "原创自我观察" : "Original self-reflection")
    : (zh ? "自编风格问卷" : "Original style questionnaire");
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 60, background: "#f8fafc", color: "#0f172a", fontFamily: "FunNoto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color, fontSize: 28 }}><span>FermatMind</span><span>{questionnaire ? questionnaireLabel : (zh ? (result ? "公开画像指南" : "原创趣味测试") : (result ? "Public result guide" : "Original quiz"))}</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {result && <div style={{ display: "flex", fontSize: 27, color }}>{topic}</div>}
      <div style={{ display: "flex", fontSize: title.length > 65 ? 48 : 60, lineHeight: 1.25 }}>{title}</div>
      <div style={{ display: "flex", gap: 12 }}><div style={{ width: 110, height: 8, background: color, borderRadius: 4 }} /><div style={{ width: 36, height: 8, background: "#cbd5e1", borderRadius: 4 }} /><div style={{ width: 16, height: 8, background: "#cbd5e1", borderRadius: 4 }} /></div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 25, color: "#475569" }}><span>fermatmind.com</span><span>{questionnaire ? (zh ? "完整报告免费 · 自我探索" : "Full report free · Self-exploration") : (zh ? "完整内容免费 · 仅供娱乐" : "Full content free · Just for fun")}</span></div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: await quizFont(quiz?.slug ?? questionnaire!.slug), weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
