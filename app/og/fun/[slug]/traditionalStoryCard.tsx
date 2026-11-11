import { hasTraditionalObservation } from "@/lib/i18n/traditionalObservationPaths";
import { hasTraditionalDirectional } from "@/lib/i18n/traditionalDirectionalPaths";
import { adultAgePreferencesCard } from "./adultAgePreferencesCard";
import { bleachOpenGraphCard } from "@/lib/entertainment/bleachCard";
import { philosopherOpenGraphCard } from "@/lib/entertainment/philosopherCard";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { auraColors } from "@/lib/questionnaires/auraColors";
import { characterPortraitCard } from "./characterPortraitCard";
import { auraColorCard } from "./auraColorCard";
import { moonPhaseOpenGraphCard } from "@/lib/entertainment/moonPhaseCard";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { spaceMarineChapterCard } from "./spaceMarineChapterCard";
import { fantasyOpenGraphCard } from "@/lib/entertainment/fantasyCard";
import { findPublicPortrait, portraitDescription } from "@/lib/entertainment/guides";
import { hasTraditionalPrivateReflection, hasTraditionalRelationshipSix, hasTraditionalWorkReasoning, traditionalLikertRoute } from "@/lib/i18n/traditionalLikertPaths";
import { loadTraditionalLikert } from "@/lib/i18n/zh-TW/likertQuestionnaires";
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
  if (hasTraditionalObservation(slug)) {
    const { loadTraditionalObservation } = await import("@/lib/i18n/zh-TW/observationQuestionnaires");
    const item = await loadTraditionalObservation(slug);
    const result = portrait && item ? item.quiz.profiles.find(profile => profile.id === portrait) : undefined;
    if (!item || (portrait && !result)) return new Response("Image unavailable", { status: 404 });
    archetypeFont ??= readFont("archetype-questionnaire-700.ttf");
    return publicCard(result?.title.zh ?? item.quiz.title.zh, result?.summary.zh ?? item.quiz.description.zh,
      Boolean(result), await archetypeFont, `${item.quiz.questions.length} 道原創觀察題`, "公開主題指南");
  }
  if (hasTraditionalDirectional(slug)) {
    const { loadTraditionalDirectional } = await import("@/lib/i18n/zh-TW/directionalQuestionnaires");
    const item = await loadTraditionalDirectional(slug);
    const result = portrait && item ? item.quiz.profiles.find(profile => profile.id === portrait) : undefined;
    if (!item || (portrait && !result)) return new Response("Image unavailable", { status: 404 });
    archetypeFont ??= readFont("archetype-questionnaire-700.ttf");
    if (slug === "adult-age-preferences") return adultAgePreferencesCard("zh-TW", item.quiz.title.zh, result?.directionIds, await archetypeFont);
    return publicCard(result?.title.zh ?? item.quiz.title.zh, result?.summary.zh ?? item.quiz.description.zh, Boolean(result), await archetypeFont,
      `${item.quiz.questions.length} 道二選一題目`, "公開結果指南");
  }
  if (traditionalLikertRoute(`/tests/explore/${slug}`)) {
    const item = hasTraditionalPrivateReflection(slug)
      ? await (await import("@/lib/i18n/zh-TW/privateReflectionQuestionnaires")).loadTraditionalPrivateReflection(slug)
      : hasTraditionalWorkReasoning(slug)
        ? await (await import("@/lib/i18n/zh-TW/workReasoningQuestionnaires")).loadTraditionalWorkReasoning(slug)
        : hasTraditionalRelationshipSix(slug)
          ? await (await import("@/lib/i18n/zh-TW/relationshipSixQuestionnaires")).loadTraditionalRelationshipSix(slug)
          : await loadTraditionalLikert(slug);
    const result = item && portrait ? item.quiz.profiles.find(profile => profile.id === portrait) : undefined;
    if (!item || (portrait && !result)) return new Response("Image unavailable", { status: 404 });
    archetypeFont ??= readFont("archetype-questionnaire-700.ttf");
    const editions: Record<string, string> = {
      "capacity-to-love-test": "CTL-I 2018 題本工作譯版",
      "love-languages": "費馬原創 50 道關懷方式題",
      "love-type-16": "費馬原創 32 道關係偏好題",
      "mote-type": "24 組互動選擇",
      "parenting-style": "費馬原創 12 道照顧行為題",
      "relationship-preferences": "24 組戀愛安排選擇",
      "asvab-practice-test": "費馬原創 32 道英文練習題",
      "asvab-science-mechanical-practice-test": "費馬原創 30 道英文練習題",
      "employer-reasoning-practice-test": "費馬原創 18 道英文練習題",
      "watson-glaser-practice-test": "費馬原創 30 道英文練習題",
      "written-coordination-practice": "費馬原創書面協調練習",
      "distributed-work-choices": "費馬原創 24 組協作選擇",
      "freelance-ready": "費馬原創 20 項接案準備回顧",
      "remote-work": "費馬原創 20 項遠距工作準備回顧",
      "social-intelligence-test": "IPIP-VIA-R 四道自述題",
      "character-strengths": "IPIP-VIA-R 96 道自述題",
      hexaco: "IPIP HEXACO 240 道自述題",
      "work-traits-reflection": "費馬原創 42 道工作行為題",
      "growth-mindset-fixed-mindset": "費馬原創 12 道學習信念題",
      "grit-test": "費馬原創 16 道目標回顧題",
      "tech-savvy": "費馬原創 6 道工具信心題",
      "time-management": "費馬原創 24 道時間管理題",
      "procrastinator-type-test": "費馬原創 24 道拖延行為題",
      "everyday-control-style": "費馬原創 24 道共同安排題",
      "apology-language": "費馬原創 20 道道歉偏好題",
      "conflict-styles": "費馬原創 20 道分歧行動題",
      "love-fight-style": "費馬原創 20 道伴侶分歧題",
      "friendship-compatibility": "費馬原創 20 道友誼回顧題",
      "work-activity-interests": "費馬原創 60 道工作興趣題",
      "work-ethics": "費馬原創 24 道工作習慣題",
      "culture-fit": "費馬原創 24 道工作安排題",
      "competency-test": "費馬原創 36 道工作行為題",
      "energy-flow": "費馬原創 20 道專注節奏題",
      "deep-desire": "費馬原創 24 道動機主題題目",
      "light-triad-test": "LTS 12 道自述題",
      "maturity-test": "費馬原創 24 道日常行為題",
      "sdt-motivation": "費馬原創 24 道心理需要題",
      "sternberg-love": "費馬原創 15 道愛情三角題",
      "jealousy-scale": "費馬原創 18 道嫉妒反思題",
      "wholesome-partner": "費馬原創 32 道伴侶相處題",
      "freudian-personality": "費馬原創 48 道歷史詞彙反思題",
      "eras-of-you-test": "費馬原創 24 道生活階段題",
      "rizz-test": "費馬原創 20 道互動題",
      "feminine-energy": "費馬原創 20 道文化表達題",
      "music-taste-test": "費馬原創 24 道音樂偏好題",
      "dark-triad": "費馬原創 18 道主題題目",
      "dark-tetrad-sd4": "SD4 發表版 28 道題目",
      "cognitive-functions-test": "費馬原創 32 題自評與 56 題二選一",
      "values": "費馬原創 30 道價值觀題",
      "morality-6": "MFQ-2 作者版 36 道題目",
      "libertarian": "費馬原創 32 道政治原則題",
      "body-frame-observations": "費馬原創 12 道輪廓觀察題",
      "face-self-image": "費馬原創 16 道臉部自我觀察題",
      "outfit-line-preferences": "費馬原創 15 道服裝線條題",
      "activity-engagement-patterns": "費馬原創 20 道活動參與題",
      "attraction-experiences": "費馬原創 15 道吸引經驗題",
      "chakra": "費馬原創 28 道日常反思題",
      "connection-meaning-reflection": "費馬原創 15 道人際連結題",
      "eq-dashboard": "費馬原創 40 道情緒頻率題",
      "egogram": "費馬原創 20 道自我狀態題",
      "type-ab": "費馬原創 20 道行為題",
      "learning-style": "費馬原創 20 道學習偏好題",
      "multiple-intelligences": "費馬原創 32 道活動自評題",
      "hsp-sensitivity-quiz": "費馬原創 24 道近期體驗題",
      "people-pleaser": "PPS 10 道自述題",
      "trust-issues-test": "費馬原創 24 道信任行動題",
      "toxic-positivity-test": "費馬原創 18 道積極壓力題",
      "toxic-trait": "費馬 20 道互動習慣題",
      "difficult-person-test": "費馬原創 28 道互動行為題",
      "interpersonal-preferences": "費馬原創 24 道人際偏好題",
      "social-attitudes-reflection": "費馬原創 24 道社會態度題",
      "cultural-dimensions": "費馬原創 36 道文化主題題目",
      "social-battery-test": "費馬原創 20 道社交電量題",
      "humor-style-test": "費馬原創 24 道幽默風格題",
      "relationship-worry-habits": "費馬原創 16 道關係擔心題",
      "relationship-habits": "費馬原創 16 道相處習慣題",
      "dating-outlook": "費馬原創 16 道戀愛信念題",
      "intimacy-values": "費馬原創 25 道親密價值題",
      "relationship-commitment": "費馬原創 24 道關係承諾題",
    };
    const privateReflection = hasTraditionalPrivateReflection(slug);
    const edition = editions[slug] ?? (privateReflection ? "自我觀察與回顧" : "IPIP 公有領域題目");
    const guideLabel = slug === "character-strengths" ? "公開性格優勢指南"
      : privateReflection || hasTraditionalRelationshipSix(slug) || hasTraditionalWorkReasoning(slug)
        ? "公開結果指南" : "公開連續分數指南";
    return publicCard(result?.title.zh ?? item.quiz.title.zh, result?.summary.zh ?? item.quiz.description.zh, Boolean(result), await archetypeFont, edition, guideLabel);
  }
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
    if (slug === "space-marine-chapter") return spaceMarineChapterCard(quiz.profiles, "zh", await archetypeFont, result?.id, true);
    if (slug === "avatar-bender-quiz" || slug === "soldier-poet-king-quiz") return fantasyOpenGraphCard(quiz, "zh", result?.id, await archetypeFont, true);
    if (slug === "cyberpunk-edgerunners" && result) return characterPortraitCard(slug, result.id, result.title.zh, quiz.title.zh, "zh-TW", await archetypeFont);
    if (slug === "bleach") return bleachOpenGraphCard("zh", result?.id, await archetypeFont, await loadTraditionalAssessmentText());
    if (slug === "philosopher-personality-test") return philosopherOpenGraphCard("zh", result?.id, await archetypeFont, await loadTraditionalAssessmentText());
    if (slug === "moon-phase") return moonPhaseOpenGraphCard("zh", result?.id, await archetypeFont, await loadTraditionalAssessmentText());
    const aura = slug === "aura-color" && result ? auraColors[result.id] : undefined;
    if (aura && result) return auraColorCard("zh-TW", result.title.zh, aura, await archetypeFont);
    const palette = slug === "color-season";
    const editions: Record<string, string> = {
      "values-assessment": "原創工作取捨",
      "style-impression-preferences": "原創造型偏好",
      "connection-ideals": "原創連結偏好",
      "color-season": "配色偏好測驗",
      "male-archetype-test": "原創四角色隱喻版",
      "moral-dilemma-test": "原創五組倫理提問",
      "intelligence-type-test": "原創思考入口趣味版",
      ikigai: "原創四組交疊探索",
    };
    const edition = editions[slug] ?? "原創趣味測驗";
    const swatches = palette ? result?.paletteSwatches ?? quiz.profiles.flatMap(profile => profile.paletteSwatches?.slice(0, 1) ?? []) : undefined;
    return publicCard(result?.title.zh ?? quiz.title.zh, result?.summary.zh ?? quiz.description.zh, Boolean(result), await archetypeFont, edition,
      palette ? "公開配色指南" : undefined, swatches);
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

function publicCard(title: string, description: string, result: boolean, fontData: ArrayBuffer, label: string, guideLabel = "公開結果指南", swatches?: readonly { hex: string }[]) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#f8fafc", color: "#0f172a", fontFamily: "StoryNoto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#0f766e", fontSize: 29 }}>
        <span>費馬測試</span><span>{result ? guideLabel : label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ display: "flex", fontSize: title.length > 18 ? 54 : 66 }}>{title}</span>
        <span style={{ display: "flex", marginTop: 22, color: "#334155", fontSize: 30 }}>{description}</span>
        {swatches?.length ? <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          {swatches.map(swatch => <div key={swatch.hex} style={{ width: 110, height: 56, background: swatch.hex, border: "1px solid #cbd5e1", borderRadius: 4 }} />)}
        </div> : null}
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
