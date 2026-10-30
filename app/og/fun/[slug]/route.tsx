import { isNakshatra27ConfigurationValid } from "@/lib/questionnaires/nakshatra27";
import { isWetonStory35ConfigurationValid } from "@/lib/questionnaires/wetonStory35";
import { isBpi21ConfigurationValid } from "@/lib/questionnaires/bpi21";
import { isSuddenFear20ConfigurationValid } from "@/lib/questionnaires/suddenFear20";
import { isUnwantedActions20ConfigurationValid } from "@/lib/questionnaires/unwantedActions20";
import { isFocusContext16ConfigurationValid } from "@/lib/questionnaires/focusContext16";
import { isWrittenLanguage20ConfigurationValid } from "@/lib/questionnaires/writtenLanguage20";
import { isHealthWorry21ConfigurationValid } from "@/lib/questionnaires/healthWorry21";
import { isSleepExperiences20ConfigurationValid } from "@/lib/questionnaires/sleepExperiences20";
import { isBereavement16ConfigurationValid } from "@/lib/questionnaires/bereavement16";
import { isSupportReflection18ConfigurationValid } from "@/lib/questionnaires/supportReflection18";
import { isConnectionCheckIn21ConfigurationValid } from "@/lib/questionnaires/connectionCheckIn21";
import { isPressureActions12ConfigurationValid } from "@/lib/questionnaires/pressureActions12";
import { isTraumaResponse20ConfigurationValid } from "@/lib/questionnaires/traumaResponse20";
import { isDistributedWork24ConfigurationValid } from "@/lib/questionnaires/distributedWork24";
import { isWrittenCoordinationConfigurationValid } from "@/lib/questionnaires/writtenCoordination";
import { isWorkRole12ConfigurationValid } from "@/lib/questionnaires/workRole12";
import { isSbti31ConfigurationValid } from "@/lib/questionnaires/sbti31";
import { isCritical30ConfigurationValid } from "@/lib/questionnaires/critical30";
import { isReasoning18ConfigurationValid } from "@/lib/questionnaires/reasoning18";
import { isMattering10ConfigurationValid } from "@/lib/questionnaires/mattering10";
import { isTechnical30ConfigurationValid } from "@/lib/questionnaires/technical30";
import { isDvmsq18ConfigurationValid } from "@/lib/questionnaires/dvmsq18";
import { isSynes15ConfigurationValid } from "@/lib/questionnaires/synes15";
import { isAfqt32ConfigurationValid } from "@/lib/questionnaires/afqt32";
import { isAnger20ConfigurationValid } from "@/lib/questionnaires/anger20";
import { isSens16ConfigurationValid } from "@/lib/questionnaires/sens16";
import { isImagery12ConfigurationValid } from "@/lib/questionnaires/imagery12";
import { isImposter20ConfigurationValid } from "@/lib/questionnaires/imposter20";
import { isCatQ25ConfigurationValid } from "@/lib/questionnaires/catq25";
import { isMostLeastConfigurationValid } from "@/lib/questionnaires/mostLeast";
import { isCareerMatchConfigurationValid } from "@/lib/questionnaires/careerMatch";
import { isLoveType16ConfigurationValid } from "@/lib/questionnaires/loveType16";
import { isFds32ConfigurationValid } from "@/lib/questionnaires/fds32";
import { isMentalAgeConfigurationValid } from "@/lib/questionnaires/mentalAge";
import { isMiniOrientationConfigurationValid } from "@/lib/questionnaires/miniOrientation";
import { isStressReflection4ConfigurationValid } from "@/lib/questionnaires/stressReflection4";
import { isMiniConflictConfigurationValid } from "@/lib/questionnaires/miniConflict";
import { isFourAxesConfigurationValid } from "@/lib/questionnaires/fourAxes";
import { isMiniVirtuesConfigurationValid } from "@/lib/questionnaires/miniVirtues";
import { isEuphoriaConfigurationValid } from "@/lib/questionnaires/euphoria";
import { isMiniShadowConfigurationValid } from "@/lib/questionnaires/miniShadow";
import { isPreparationActions20ConfigurationValid } from "@/lib/questionnaires/preparationActions20";
import { isMiniCopingConfigurationValid } from "@/lib/questionnaires/miniCoping";
import { isMiniHabitConfigurationValid } from "@/lib/questionnaires/miniHabit";
import { isMiniIntimacyConfigurationValid } from "@/lib/questionnaires/miniIntimacy";
import { isNatalChartConfigurationValid } from "@/lib/questionnaires/natalChart";
import { isNineStarYearConfigurationValid } from "@/lib/questionnaires/nineStarYear";
import { isMiniBreakupConfigurationValid } from "@/lib/questionnaires/miniBreakup";
import { isHoldingBack35ConfigurationValid } from "@/lib/questionnaires/holdingBack35";
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
import { isTipi10ConfigurationValid } from "@/lib/questionnaires/tipi10";
import { isSd4ConfigurationValid } from "@/lib/questionnaires/sd4";
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
  if (questionnaire?.kind === "sudden-fear20" && !isSuddenFear20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "nakshatra27" && !isNakshatra27ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "unwanted-actions20" && !isUnwantedActions20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "focus-context16" && !isFocusContext16ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "written-language20" && !isWrittenLanguage20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "health-worries21" && !isHealthWorry21ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "sleep-experiences20" && !isSleepExperiences20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "bereavement16" && !isBereavement16ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "support-reflection18" && !isSupportReflection18ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "connection-checkin21" && !isConnectionCheckIn21ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "pressure-actions12" && !isPressureActions12ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "trauma-response20" && !isTraumaResponse20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "distributed-work24" && !isDistributedWork24ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "written-coordination" && !isWrittenCoordinationConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "work-role12" && !isWorkRole12ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "dvmsq18" && !isDvmsq18ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "synes15" && !isSynes15ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "reasoning18" && !isReasoning18ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "critical30" && !isCritical30ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "technical30" && !isTechnical30ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "afqt32" && !isAfqt32ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "anger20" && !isAnger20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "sens16" && !isSens16ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "imagery12" && !isImagery12ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "imposter20" && !isImposter20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "catq25" && !isCatQ25ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "most-least" && !isMostLeastConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "career-theme-compare" && !isCareerMatchConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "love-type16" && !isLoveType16ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "fds32" && !isFds32ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if ((((questionnaire?.kind === "mini-virtues" || questionnaire?.slug === "seven-sins-virtues-test") && !isMiniVirtuesConfigurationValid(questionnaire))) || (questionnaire?.slug === "euphoria-character-quiz" && !isEuphoriaConfigurationValid(questionnaire))) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "natal-chart" && !isNatalChartConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "nine-star-year" && !isNineStarYearConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-orientation" && !isMiniOrientationConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-conflict" && !isMiniConflictConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-habit" && !isMiniHabitConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-intimacy" && !isMiniIntimacyConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-coping" && !isMiniCopingConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-breakup" && !isMiniBreakupConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mini-shadow" && !isMiniShadowConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "preparation-actions20" && !isPreparationActions20ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "holding-back35" && !isHoldingBack35ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "fscrs22" && !isFscrs22ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "parenting-practices" && !isParentingPracticesConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "spq92" && !isSpq92ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "adexi14" && !isAdexi14ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "birth-number" && !isBirthNumberConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "ptq15" && !isPtq15ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.slug === "dark-tetrad-sd4" && !isSd4ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "tipi10" && !isTipi10ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
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
  if (questionnaire?.kind === "four-axes" && !isFourAxesConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "stress-reflection4" && !isStressReflection4ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mental-age" && !isMentalAgeConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "sbti31" && !isSbti31ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "mattering10" && !isMattering10ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "bpi21" && !isBpi21ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  if (questionnaire?.kind === "weton-story35" && !isWetonStory35ConfigurationValid(questionnaire)) return new Response("Image unavailable", { status: 404 });
  const quiz = questionnaire ? null : await loadFunQuiz(slug);
  if (!quiz && !questionnaire) return new Response("Image unavailable", { status: 404 });
  const portrait = query.get("portrait");
  const result = portrait ? (quiz ? findPublicPortrait(quiz, portrait) : questionnaire?.profiles.find(profile => profile.id === portrait)) : undefined;
  if (portrait && !result) return new Response("Image unavailable", { status: 404 });
  const topic = quiz?.seo.topic[locale] ?? questionnaire!.title[locale];
  const title = result?.title[locale] ?? topic, zh = locale === "zh";
  const color = colors[quiz?.category ?? questionnaire?.category ?? "framework"] ?? colors.metaphor;
  const questionnaireLabel = questionnaire?.kind === "written-language20" ? (result ? (zh ? "完整公开书面语言读法" : "Complete public written-language reading") : (zh ? "20条原创观察 · 四篇全文免费" : "20 original observations · Four full guides, free")) : questionnaire?.kind === "nakshatra27" ? (result ? (zh ? "完整公开出生宿文化指南" : "Complete public birth-star cultural guide") : (zh ? "Spica参考月球 · 27篇全文免费" : "Spica-reference Moon · 27 full guides, free")) : questionnaire?.kind === "focus-context16" ? (result ? (zh ? "完整公开日常情境读法" : "Complete public daily-context reading") : (zh ? "16条原创观察 · 四篇全文免费" : "16 original observations · Four full guides, free")) : questionnaire?.kind === "unwanted-actions20" ? (result ? (zh ? "完整公开想法与动作读法" : "Complete public thoughts-and-actions reading") : (zh ? "20条原创观察 · 五篇全文免费" : "20 original observations · Five full guides, free")) : questionnaire?.kind === "sudden-fear20" ? (result ? (zh ? "完整公开突然恐惧读法" : "Complete public sudden-fear reading") : (zh ? "20条原创观察 · 四篇全文免费" : "20 original observations · Four full guides, free")) : questionnaire?.kind === "weton-story35" ? (zh ? "原创文化故事 · 独立历法参考" : "Original cultural stories · Separate calendar") : questionnaire?.kind === "health-worries21" ? (result ? (zh ? "完整公开健康担忧读法" : "Complete public health-worry reading") : (zh ? "21条原创观察 · 三篇全文免费" : "21 original observations · Three full guides, free")) : questionnaire?.kind === "sleep-experiences20" ? (result ? (zh ? "完整公开睡眠读法" : "Complete public sleep reading") : (zh ? "20条原创观察 · 五篇全文免费" : "20 original observations · Five full guides, free")) : questionnaire?.kind === "bpi21" ? (zh ? "发表BPI-21 · 工作中译" : "Published BPI-21") : questionnaire?.kind === "bereavement16" ? (result ? (zh ? "完整公开丧失读法" : "Complete public bereavement reading") : (zh ? "16条原创观察 · 五篇全文免费" : "16 original observations · Five full guides, free")) : questionnaire?.kind === "support-reflection18" ? (result ? (zh ? "完整公开支持读法" : "Complete public support reading") : (zh ? "18条原创陈述 · 四篇全文免费" : "18 original statements · Four full guides, free")) : questionnaire?.kind === "connection-checkin21" ? (result ? (zh ? "完整公开联系读法" : "Complete public connection reading") : (zh ? "21条原创观察 · 三篇全文免费" : "21 original observations · Three full guides, free")) : questionnaire?.kind === "pressure-actions12" ? (result ? (zh ? "完整公开行动读法" : "Complete public action reading") : (zh ? "12条原创行动 · 四篇全文免费" : "12 original action observations · Four full guides, free")) : questionnaire?.kind === "trauma-response20" ? (result ? (zh ? "完整公开观察读法" : "Complete public observation reading") : (zh ? "20条原创观察 · 四篇全文免费" : "20 original observations · Four full guides, free")) : questionnaire?.kind === "distributed-work24" ? (result ? (zh ? "完整公开协作读法" : "Complete public coordination reading") : (zh ? "24组原创协作选择" : "24 original coordination pairs")) : questionnaire?.kind === "written-coordination" ? (result ? (zh ? "公开书面练习指南" : "Public written-practice guide") : (zh ? "原创书面协调练习" : "Original written coordination practice")) : questionnaire?.kind === "sbti31" ? (zh ? "小程序原31题 · 原计分与25种画像" : "Original Mini 31 · Original scoring · 25 portraits") : questionnaire?.kind === "tipi10" ? (zh ? "TIPI原十题 · 五维独立均值" : "Original TIPI 10 · Five separate means") : questionnaire?.kind === "critical30" ? (result ? (zh ? "五部分完整学习指南 · 全文免费" : "Five-part study guide · Full text free") : (zh ? "30道原创英文题 · 整卷连续计时" : "30 original English questions · One continuous clock")) : questionnaire?.kind === "mattering10" ? (zh ? "GMS五题＋AMS五题 · 两项独立读法" : "GMS 5 + AMS 5 · Two separate readings") : questionnaire?.kind === "reasoning18" ? (result ? (zh ? "三领域学习指南 · 全文免费" : "Three-area study guide · Full text free") : (zh ? "18道原创英文题 · 双语解析" : "18 original English questions · Bilingual solutions")) : questionnaire?.kind === "technical30" ? (result ? (zh ? "五领域学习指南 · 全文免费" : "Five-area study guide · Full text free") : (zh ? "30道原创英文题 · 双语解析" : "30 original English questions · Bilingual solutions")) : questionnaire?.slug === "cognitive-functions-test" ? (result ? (zh ? "两种方法 · 完整公开指南" : "Two methods · Full public guides") : (zh ? "32题自评 / 56题二选一" : "32 ratings / 56 choices")) : questionnaire?.kind === "afqt32" ? (result ? (zh ? "四领域学习指南 · 全文免费" : "Four-area study guide · Full text free") : (zh ? "32道原创英文题 · 双语解析" : "32 original English questions · Bilingual solutions")) : questionnaire?.kind === "anger20" ? (result ? (zh ? "原创愤怒指南 · 完整公开读法" : "Original anger guide · Full public reading") : (zh ? "20条原创反应回顾 · 无风险分段" : "20 original response prompts · No risk tiers")) : questionnaire?.kind === "sens16" ? (result ? (zh ? "原创感官指南 · 完整公开读法" : "Original sensory guide · Full public reading") : (zh ? "16条原创反应回顾 · 无类型分配" : "16 original response prompts · No type assignment")) : questionnaire?.kind === "dvmsq18" ? (result ? (zh ? "DVMSQ源表 · 完整公开读法" : "DVMSQ source form · Full public guide") : (zh ? "1＋18源题 · 仅原始合计" : "1 + 18 source prompts · Raw sums only")) : questionnaire?.kind === "synes15" ? (result ? (zh ? "原创体验指南 · 完整公开读法" : "Original experience guide · Full public reading") : (zh ? "15条原创体验记录 · 非一致性实验" : "15 original experience prompts · Not a consistency test")) : questionnaire?.kind === "imagery12" ? (result ? (zh ? "原创意象情境 · 完整公开读法" : "Original imagery context · Full public guide") : (zh ? "12个原创意象情境 · 非VVIQ" : "12 original imagery prompts · Not VVIQ")) : questionnaire?.kind === "imposter20" ? (result ? (zh ? "原创情境完整公开读法" : "Original context · Full public guide") : (zh ? "20条原创反思 · 非CIPS量表" : "20 original prompts · Not the CIPS")) : questionnaire?.kind === "catq25" ? (result ? (zh ? "CAT-Q完整公开读法" : "CAT-Q full public guide") : (zh ? "25项原文与中文工作译文" : "25 source statements · No diagnostic cutoff")) : questionnaire?.kind === "most-least" ? (result ? (zh ? "最符合／最不符合 · 完整读法" : "Most/Least · Full public guide") : (zh ? "原创16组题式练习" : "16 original practice blocks")) : questionnaire?.kind === "career-theme-compare" ? (zh ? "兴趣主题与真实职业比较" : "Interest themes and real roles") : questionnaire?.kind === "love-type16" ? (zh ? "原创四轴组合 · 保留全部并列" : "Original four-axis combinations · Every tie retained") : questionnaire?.kind === "fds32" ? (zh ? "FDS八组独立读法" : "FDS · Eight separate readings") : questionnaire?.kind === "mental-age" ? (zh ? "原创娱乐年龄 · 公开公式" : "Original playful age · Open formula") : questionnaire?.kind === "mini-orientation" ? (result ? (zh ? "公开完整主题指南" : "Public full topic guide") : (zh ? "二十题非分类自我观察" : "20 non-classifying reflection statements")) : questionnaire?.kind === "stress-reflection4" ? (result ? (zh ? "完整公开分数指南" : "Complete public score guide") : (zh ? "四题原创近一个月压力自评" : "4 original monthly check-in prompts")) : questionnaire?.kind === "mini-conflict" ? (result ? (zh ? "公开完整行为指南" : "Public full behavior guide") : (zh ? "本人近三个月行为观察" : "Own behavior, past three months")) : questionnaire?.kind === "four-axes" ? (result ? (zh ? "完整公开领域指南" : "Complete public domain guide") : (zh ? "60题原创四轴自画像" : "60 original four-axis statements")) : questionnaire?.kind === "mini-virtues" ? (result ? (zh ? "七组独立读法 · 完整公开指南" : "Seven separate readings · Complete public guide") : (zh ? "二十八题日常观察" : "28 everyday statements")) : questionnaire?.slug === "euphoria-character-quiz" ? (zh ? "非官方同人编辑 · 第一、二季" : "Unofficial fan edition · Seasons 1–2") : questionnaire?.kind === "mini-shadow" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "近三个月的自报反应" : "Recent self-reported responses")) : questionnaire?.kind === "preparation-actions20" ? (result ? (zh ? "公开完整行动指南" : "Public complete action guide") : (zh ? "20项原创准备行动回顾" : "20 original preparation actions")) : questionnaire?.kind === "mini-coping" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "日常应对选择" : "Everyday coping choices")) : questionnaire?.kind === "mini-habit" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "日常习惯观察" : "Everyday habit reflection")) : questionnaire?.kind === "mini-intimacy" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "成年人亲密互动偏好" : "Adult intimacy preferences")) : questionnaire?.kind === "natal-chart" ? (result ? (zh ? "星盘符号完整解释" : "Complete chart-symbol guide") : (zh ? "已知时间星盘" : "Known-time chart")) : questionnaire?.kind === "nine-star-year" ? (result ? (zh ? "文化象义 · 完整公开指南" : "Cultural meanings · Complete public guide") : (zh ? "年度文化参考" : "Annual cultural reference")) : questionnaire?.kind === "mini-breakup" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "原创关系复盘" : "Original breakup reflection")) : questionnaire?.kind === "holding-back35" ? (result ? (zh ? "公开完整观察指南" : "Public complete guide") : (zh ? "原创七类日常观察" : "Original everyday reflection")) : questionnaire?.kind === "fscrs22" ? (result ? (zh ? "完整公开解释" : "Complete public explanation") : (zh ? "22题 · 三部分独立读数" : "22 statements · Three separate readouts")) : questionnaire?.kind === "mini-friction" ? (result ? (zh ? "完整互动读法" : "Full interaction guide") : (zh ? "原创小程序互动自评" : "Original Mini interaction reflection")) : questionnaire?.kind === "ctl41" ? (result ? (zh ? "完整领域读法" : "Full domain guide") : (zh ? "2018源题文工作译版" : "2018 source items · Working edition")) : questionnaire?.kind === "parenting-practices" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "原创养育行为回顾" : "Original parenting reflection")) : questionnaire?.kind === "spq92" ? (result ? (zh ? "SPQ公开分数读法" : "SPQ public score guide") : (zh ? "SPQ92项自评" : "SPQ 92-item self-report")) : questionnaire?.kind === "adexi14" ? (result ? (zh ? "ADEXI公开分数读法" : "ADEXI public score guide") : (zh ? "ADEXI14题自评" : "ADEXI-14 self-report")) : questionnaire?.kind === "birth-number" ? (result ? (zh ? "原创符号故事 · 完整读法免费" : "Original symbolic story · Full guide, free") : (zh ? "两种日期规则 · 十二篇原创符号指南" : "Two date rules · Twelve original symbolic guides")) : questionnaire?.kind === "ptq15" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "PTQ15原文与工作译文" : "PTQ 15: original text and working translation")) : questionnaire?.kind === "interaction-pairs" ? (result ? (zh ? "互动完整读法" : "Full interaction guide") : (zh ? "原创互动二选一" : "Original interaction pairs")) : questionnaire?.kind === "skills-evidence" ? (result ? (zh ? "公开结果说明" : "Public result guide") : (zh ? "原创任务实例盘点" : "Original task-example inventory")) : questionnaire?.kind === "saps" ? (result ? (zh ? "SAPS公开维度读法" : "SAPS public dimension guide") : (zh ? "SAPS八题工作译本" : "SAPS eight-item edition")) : questionnaire?.kind === "scs26" ? (result ? (zh ? "SCS公开分数读法" : "SCS public score guide") : (zh ? "SCS26题依许可使用" : "Licensed SCS-26 items")) : questionnaire?.kind === "cbi" ? (result ? (zh ? "CBI公开完整读法" : "CBI public full guide") : (zh ? "CBI完整源模块" : "CBI source modules")) : questionnaire?.kind === "rosenberg" ? (result ? (zh ? "RSES公开分数读法" : "RSES public score guide") : (zh ? "RSES公有领域条目" : "RSES public-domain items")) : questionnaire?.slug === "morality-6" ? (result ? (zh ? "MFQ-2公开完整读法" : "MFQ-2 public full guide") : (zh ? "MFQ-2授权原题版" : "Licensed MFQ-2 item edition")) : questionnaire?.kind === "political-coordinates" ? (result ? (zh ? "公开政策坐标说明" : "Public policy-coordinate guide") : (zh ? "原创政策选择版" : "Original policy-choice edition")) : questionnaire?.kind === "data-entry" ? (result ? (zh ? "公开结构化录入复习指南" : "Public structured-entry revision guide") : (zh ? "原创60秒结构化录入" : "Original 60-second structured entry")) : questionnaire?.slug === "color-season" ? (result ? (zh ? "公开配色指南" : "Public palette guide") : (zh ? "配色偏好测验" : "Palette preference quiz")) : questionnaire?.kind === "typing" ? (result ? (zh ? "公开打字练习复习指南" : "Public typing practice revision guide") : (zh ? "原创计时打字练习" : "Original timed typing practice")) : questionnaire?.kind === "ten-key" ? (result ? (zh ? "公开练习复习指南" : "Public practice revision guide") : (zh ? "原创数字录入练习" : "Original number-entry practice")) : result ? (zh ? "公开结果说明" : "Public result guide")
    : questionnaire?.kind === "secs" ? (zh ? "SECS2013美国议题" : "SECS 2013 U.S. issues")
    : questionnaire?.slug === "hexaco" ? (zh ? "preliminary IPIP240条" : "Preliminary IPIP 240 items")
    : questionnaire?.kind === "paired-dimensions" ? (zh ? "原创关系安排偏好" : "Original relationship arrangements")
    : questionnaire?.kind === "eight-values" ? (zh ? "8values MIT许可改编" : "8values MIT adaptation")
    : questionnaire?.kind === "practice" ? (zh ? "原创练习题" : "Original practice bank")
    : questionnaire?.slug === "dark-tetrad-sd4" ? (zh ? "SD4发表版28题 · 四项独立读法" : "Published SD4 28 · Four separate readings")
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
    : questionnaire?.slug === "stupidity-test" ? (zh ? "原创日常乌龙选择" : "Original everyday mix-up choices")
    : questionnaire?.slug === "values-assessment" ? (zh ? "原创工作取舍" : "Original work-priority choices")
    : questionnaire?.slug === "connection-ideals" ? (zh ? "原创连接偏好" : "Original connection reflection")
    : questionnaire?.slug === "style-impression-preferences" ? (zh ? "原创造型偏好" : "Original style reflection")
    : questionnaire?.kind === "archetype" ? (zh ? "原创象征测验" : "Original symbolic quiz")
    : questionnaire?.kind === "work-role12" ? (zh ? "原创任务情境回顾" : "Original task-context reflection")
    : questionnaire?.kind === "likert" ? (zh ? "原创自我观察" : "Original self-reflection")
    : (zh ? "自编风格问卷" : "Original style questionnaire");
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 60, background: "#f8fafc", color: "#0f172a", fontFamily: "FunNoto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color, fontSize: 28 }}><span>FermatMind</span><span>{questionnaire ? questionnaireLabel : (zh ? (result ? "公开画像指南" : "原创趣味测试") : (result ? "Public result guide" : "Original quiz"))}</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {result && <div style={{ display: "flex", fontSize: 27, color }}>{topic}</div>}
      <div style={{ display: "flex", fontSize: title.length > 65 ? 48 : 60, lineHeight: 1.25 }}>{title}</div>
      {questionnaire?.slug === "color-season" ? <div style={{ display: "flex", gap: 12 }}>{(questionnaire.profiles.find(p => p.id === portrait)?.paletteSwatches ?? questionnaire.profiles.flatMap(p => p.paletteSwatches?.slice(0, 1) ?? [])).map(swatch => <div key={swatch.hex} style={{ width: 110, height: 56, background: swatch.hex, border: "1px solid #cbd5e1", borderRadius: 4 }} />)}</div> : <div style={{ display: "flex", gap: 12 }}><div style={{ width: 110, height: 8, background: color, borderRadius: 4 }} /><div style={{ width: 36, height: 8, background: "#cbd5e1", borderRadius: 4 }} /><div style={{ width: 16, height: 8, background: "#cbd5e1", borderRadius: 4 }} /></div>}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 25, color: "#475569" }}><span>fermatmind.com</span><span>{questionnaire?.kind === "distributed-work24" ? (zh ? "四篇完整指南免费" : "Four full guides, free") : questionnaire?.kind === "written-coordination" ? (zh ? "完整练习指南免费" : "Full practice guides, free") : questionnaire?.kind === "sbti31" ? (zh ? "完整主题读法免费" : "Full theme guides, free") : questionnaire?.kind === "mattering10" ? (zh ? "两份完整指南免费" : "Two full guides, free") : questionnaire?.kind === "afqt32" ? (zh ? "四篇完整指南免费" : "Four full guides, free") : questionnaire?.kind === "anger20" ? (zh ? "四篇完整读法免费" : "Four full guides, free") : questionnaire?.kind === "sens16" ? (zh ? "四篇完整读法免费" : "Four full guides, free") : questionnaire?.kind === "dvmsq18" ? (zh ? "三篇完整读法免费" : "Three full guides, free") : questionnaire?.kind === "synes15" ? (zh ? "五篇完整读法免费" : "Five full guides, free") : questionnaire?.kind === "imagery12" ? (zh ? "四篇完整读法免费" : "Four full guides, free") : questionnaire?.kind === "imposter20" ? (zh ? "五篇完整读法免费" : "Five full guides, free") : questionnaire?.kind === "catq25" ? (zh ? "四篇完整读法免费" : "Four full guides, free") : questionnaire?.kind === "most-least" ? (zh ? "八主题完整读法免费" : "Eight full topic guides, free") : questionnaire?.kind === "career-theme-compare" ? (zh ? "职业主题比较免费" : "Free career-theme comparison") : questionnaire?.kind === "mini-orientation" ? (zh ? "五篇完整通用指南免费" : "Five full general guides, free") : questionnaire?.kind === "natal-chart" ? (zh ? "十二篇完整指南免费" : "Twelve complete guides, free") : questionnaire?.kind === "nine-star-year" ? (zh ? "九篇完整文化指南免费" : "Nine complete cultural guides, free") : questionnaire?.kind === "birth-number" ? (zh ? "十二篇完整指南免费" : "Twelve complete guides, free") : (questionnaire?.kind === "data-entry" || questionnaire?.kind === "ten-key" || questionnaire?.kind === "typing") ? (zh ? "计时结果与完整复习免费" : "Timed results and full revision free") : questionnaire?.kind === "practice" ? (zh ? "逐题解析与复习免费" : "Answer explanations and revision free") : questionnaire ? (zh ? "完整报告免费 · 自我探索" : "Full report free · Self-exploration") : (zh ? "完整内容免费 · 仅供娱乐" : "Full content free · Just for fun")}</span></div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: await quizFont(quiz?.slug ?? questionnaire!.slug), weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
