import { isFscrs22ConfigurationValid } from "@/lib/questionnaires/fscrs22";
import { isParentingPracticesConfigurationValid } from "@/lib/questionnaires/parentingPractices";
import { isSpq92ConfigurationValid } from "@/lib/questionnaires/spq92";
import { isAdexi14ConfigurationValid } from "@/lib/questionnaires/adexi14";
import { isMiniFrictionConfigurationValid } from "@/lib/questionnaires/miniFriction";
import { isCtl41ConfigurationValid } from "@/lib/questionnaires/ctl41";
import { isPtq15ConfigurationValid } from "@/lib/questionnaires/ptq15";
import { isInteractionPairsConfigurationValid } from "@/lib/questionnaires/interactionPairs";
import { isSkillsEvidenceConfigurationValid } from "@/lib/questionnaires/skillsEvidence";
import { isBirthNumberConfigurationValid } from "@/lib/questionnaires/birthNumber";
import { isSapsConfigurationValid } from "@/lib/questionnaires/saps";
import { isScs26ConfigurationValid } from "@/lib/questionnaires/scs26";
import { isCbiConfigurationValid } from "@/lib/questionnaires/cbi";
import { isRosenbergConfigurationValid } from "@/lib/questionnaires/rosenberg";
import { isPoliticalCoordinatesConfigurationValid } from "@/lib/questionnaires/politicalCoordinates";
import { isDataEntryConfigurationValid } from "@/lib/questionnaires/dataEntry";
import { isSecsConfigurationValid } from "@/lib/questionnaires/secs";
import { isPairedDimensionsConfigurationValid } from "@/lib/questionnaires/pairedDimensions";
import { isTypingConfigurationValid } from "@/lib/questionnaires/typing";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { findPublicPortrait } from "@/lib/entertainment/guides";
import { isTenKeyConfigurationValid } from "@/lib/questionnaires/tenKey";
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
  if (questionnaire?.kind === "fscrs22" && !isFscrs22ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "parenting-practices" && !isParentingPracticesConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "spq92" && !isSpq92ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "adexi14" && !isAdexi14ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "birth-number" && !isBirthNumberConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "ptq15" && !isPtq15ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "saps" && !isSapsConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "scs26" && !isScs26ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "cbi" && !isCbiConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "rosenberg" && !isRosenbergConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "political-coordinates" && !isPoliticalCoordinatesConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "data-entry" && !isDataEntryConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "secs" && !isSecsConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "paired-dimensions" && !isPairedDimensionsConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "typing" && !isTypingConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "ten-key" && !isTenKeyConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "interaction-pairs" && !isInteractionPairsConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "skills-evidence" && !isSkillsEvidenceConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-friction" && !isMiniFrictionConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "ctl41" && !isCtl41ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  const quiz = questionnaire ? null : await loadFunQuiz(slug);
  if (!quiz && !questionnaire) return new Response("Image unavailable", { status: 404 });
  const portrait = query.get("portrait");
  const result = portrait ? (quiz ? findPublicPortrait(quiz, portrait) : questionnaire?.profiles.find(profile => profile.id === portrait)) : undefined;
  if (portrait && !result) return new Response("Image unavailable", { status: 404 });
  const topic = quiz?.seo.topic[locale] ?? questionnaire!.title[locale];
  const title = result?.title[locale] ?? topic, zh = locale === "zh";
  const color = colors[quiz?.category ?? questionnaire?.category ?? "framework"] ?? colors.metaphor;
  const questionnaireLabel = questionnaire?.kind === "fscrs22" ? (result ? (zh ? "完整公开解释" : "Complete public explanation") : (zh ? "22题 · 三部分独立读数" : "22 statements · Three separate readouts")) : questionnaire?.kind === "mini-friction" ? (result ? (zh ? "完整互动读法" : "Full interaction guide") : (zh ? "原创小程序互动自评" : "Original Mini interaction reflection")) : questionnaire?.kind === "ctl41" ? (result ? (zh ? "完整领域读法" : "Full domain guide") : (zh ? "2018源题文工作译版" : "2018 source items · Working edition")) : questionnaire?.kind === "parenting-practices" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "原创养育行为回顾" : "Original parenting reflection")) : questionnaire?.kind === "spq92" ? (result ? (zh ? "SPQ公开分数读法" : "SPQ public score guide") : (zh ? "SPQ92项自评" : "SPQ 92-item self-report")) : questionnaire?.kind === "adexi14" ? (result ? (zh ? "ADEXI公开分数读法" : "ADEXI public score guide") : (zh ? "ADEXI14题自评" : "ADEXI-14 self-report")) : questionnaire?.kind === "birth-number" ? (result ? (zh ? "原创符号故事 · 完整读法免费" : "Original symbolic story · Full guide, free") : (zh ? "两种日期规则 · 十二篇原创符号指南" : "Two date rules · Twelve original symbolic guides")) : questionnaire?.kind === "ptq15" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "PTQ15原文与工作译文" : "PTQ 15: original text and working translation")) : questionnaire?.kind === "interaction-pairs" ? (result ? (zh ? "互动完整读法" : "Full interaction guide") : (zh ? "原创互动二选一" : "Original interaction pairs")) : questionnaire?.kind === "skills-evidence" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "原创任务实例盘点" : "Original task-example inventory")) : questionnaire?.kind === "saps" ? (result ? (zh ? "SAPS公开维度读法" : "SAPS public dimension guide") : (zh ? "SAPS八题工作译本" : "SAPS eight-item edition")) : questionnaire?.kind === "scs26" ? (result ? (zh ? "SCS公开分数读法" : "SCS public score guide") : (zh ? "SCS26题依许可使用" : "Licensed SCS-26 items")) : questionnaire?.kind === "cbi" ? (result ? (zh ? "CBI公开完整读法" : "CBI public full guide") : (zh ? "CBI完整源模块" : "CBI source modules")) : questionnaire?.kind === "rosenberg" ? (result ? (zh ? "RSES公开分数读法" : "RSES public score guide") : (zh ? "RSES公有领域条目" : "RSES public-domain items")) : questionnaire?.slug === "morality-6" ? (result ? (zh ? "MFQ-2公开完整读法" : "MFQ-2 public full guide") : (zh ? "MFQ-2授权原题版" : "Licensed MFQ-2 item edition")) : questionnaire?.kind === "political-coordinates" ? (result ? (zh ? "公开政策坐标说明" : "Public policy-coordinate guide") : (zh ? "原创政策选择版" : "Original policy-choice edition")) : questionnaire?.kind === "data-entry" ? (result ? (zh ? "公开结构化录入复习指南" : "Public structured-entry revision guide") : (zh ? "原创60秒结构化录入" : "Original 60-second structured entry")) : questionnaire?.slug === "color-season" ? (result ? (zh ? "公开配色指南" : "Public palette guide") : (zh ? "配色偏好测验" : "Palette preference quiz")) : questionnaire?.kind === "typing" ? (result ? (zh ? "公开打字练习复习指南" : "Public typing practice revision guide") : (zh ? "原创计时打字练习" : "Original timed typing practice")) : questionnaire?.kind === "ten-key" ? (result ? (zh ? "公开练习复习指南" : "Public practice revision guide") : (zh ? "原创数字录入练习" : "Original number-entry practice")) : result ? (zh ? "公开结果说明" : "Public result guide")
    : questionnaire?.kind === "secs" ? (zh ? "SECS2013美国议题" : "SECS 2013 U.S. issues")
    : questionnaire?.slug === "hexaco" ? (zh ? "preliminary IPIP240条" : "Preliminary IPIP 240 items")
    : questionnaire?.kind === "paired-dimensions" ? (zh ? "原创关系安排偏好" : "Original relationship arrangements")
    : questionnaire?.kind === "eight-values" ? (zh ? "8values MIT许可改编" : "8values MIT adaptation")
    : questionnaire?.kind === "practice" ? (zh ? "原创练习题" : "Original practice bank")
    : questionnaire?.slug === "dark-triad" ? (zh ? "原创三组主题观察" : "Original three-theme reflection")
    : questionnaire?.slug === "moral-dilemma-test" ? (zh ? "原创五组伦理提问" : "Original reflection on five ethical questions")
    : questionnaire?.slug === "egogram" ? (zh ? "原创五组互动观察" : "Original reflection on five interaction stances")
    : questionnaire?.slug === "social-intelligence-test" ? (zh ? "IPIP-VIA-R四条自述" : "Four IPIP-VIA-R self-reports")
    : questionnaire?.slug === "male-archetype-test" ? (zh ? "原创四角色隐喻版" : "Original four-role metaphor edition")
    : questionnaire?.slug === "ikigai" ? (zh ? "原创四组交叠探索" : "Original four-overlap exploration")
    : questionnaire?.slug === "grit-test" ? (zh ? "原创长期目标回顾" : "Original long-term-goal reflection")
    : questionnaire?.slug === "toxic-trait" ? (zh ? "原创互动习惯自我观察" : "Original interaction-habits reflection")
    : questionnaire?.slug === "intelligence-type-test" ? (zh ? "原创思考入口趣味版" : "Original thinking-approach quiz")
    : ["locus-of-control", "empathy"].includes(questionnaire?.slug ?? "") ? (zh ? "IPIP公有领域条目" : "Public-domain IPIP items")
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
      {questionnaire?.slug === "color-season" ? <div style={{ display: "flex", gap: 12 }}>{(questionnaire.profiles.find(p => p.id === portrait)?.paletteSwatches ?? questionnaire.profiles.flatMap(p => p.paletteSwatches?.slice(0, 1) ?? [])).map(swatch => <div key={swatch.hex} style={{ width: 110, height: 56, background: swatch.hex, border: "1px solid #cbd5e1", borderRadius: 4 }} />)}</div> : <div style={{ display: "flex", gap: 12 }}><div style={{ width: 110, height: 8, background: color, borderRadius: 4 }} /><div style={{ width: 36, height: 8, background: "#cbd5e1", borderRadius: 4 }} /><div style={{ width: 16, height: 8, background: "#cbd5e1", borderRadius: 4 }} /></div>}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 25, color: "#475569" }}><span>fermatmind.com</span><span>{questionnaire?.kind === "birth-number" ? (zh ? "十二篇完整指南免费" : "Twelve complete guides, free") : (questionnaire?.kind === "data-entry" || questionnaire?.kind === "ten-key" || questionnaire?.kind === "typing") ? (zh ? "计时结果与完整复习免费" : "Timed results and full revision free") : questionnaire?.kind === "practice" ? (zh ? "逐题解析与复习免费" : "Answer explanations and revision free") : questionnaire ? (zh ? "完整报告免费 · 自我探索" : "Full report free · Self-exploration") : (zh ? "完整内容免费 · 仅供娱乐" : "Full content free · Just for fun")}</span></div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: await quizFont(quiz?.slug ?? questionnaire!.slug), weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
