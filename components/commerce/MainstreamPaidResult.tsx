"use client";
import { findDiscProfileByCounts } from "@/components/result/disc/discPreviewProfiles";
import { discPreviewLocales } from "@/components/result/disc/discPreviewLocale";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, BarChart3, BookOpen, LockKeyhole, Brain, Compass, Flower2, Network, Palette, Target, Zap, Handshake, Waves, ArrowUpRight } from "lucide-react";
import styles from "@/components/career/unlock-report-experience.module.css";
import { useState, type ReactNode } from "react";
import type { ReportResponse, ResultResponse, RiasecPurchase } from "@/lib/api/v0_3";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { Career94Checkout } from "@/app/(localized)/[locale]/career/assessment/Career94Purchase";
import { isIqScaleCode } from "@/lib/iq/constants";
import { ReasoningUnlockPreview, ReasoningUnlockSummary, type ReasoningPreview } from "./ReasoningUnlockPreview";
import { DiscUnlockPreview, buildDiscDesignPreview, type DiscDesignPreview } from "./DiscUnlockPreview";
import { TraitProfileUnlockPreview, buildEqProfile, type TraitProfilePreview } from "./TraitProfileUnlockPreview";
import { ResultPreviewChapters } from "./ResultPreviewChapters";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { eqUnlockSchema } from "@/lib/eq/resultPage";
import { CareerRefundPanel } from "./CareerRefundPanel";

const names: Record<string, [string, string, string]> = {
  MBTI: ["MBTI 性格", "MBTI 性格", "MBTI-style personality"],
  BIG5_OCEAN: ["大五人格", "大五人格", "Big Five personality"],
  ENNEAGRAM: ["九型人格", "九型人格", "Enneagram"],
  IQ_RAVEN: ["推理测试", "推理測試", "Reasoning test"],
  IQ_INTELLIGENCE_QUOTIENT: ["推理测试", "推理測試", "Reasoning test"],
  EQ_60: ["情商自评", "情商自評", "Emotional intelligence self-report"],
  JUNG_ARCHETYPES: ["荣格十二原型", "榮格十二原型", "Jungian archetypes"],
  JUNG_COGNITIVE_FUNCTIONS: ["荣格认知功能", "榮格認知功能", "Jungian cognitive functions"],
  DISC_BEHAVIOR: ["DISC 行为风格", "DISC 行為風格", "DISC behavioral styles"],
};
const sections: Record<string, [string, string, string][]> = {
  MBTI: [["完整偏好与类型解读", "完整偏好與型別解讀", "Full preference and type readings"], ["工作与人际关系章节", "工作與人際關係章節", "Work and relationship chapters"]],
  BIG5_OCEAN: [["五维详细解读", "五維詳細解讀", "Detailed readings of the five traits"], ["侧面解读与行动建议", "側面解讀與行動建議", "Facet readings and actions available for this form"]],
  ENNEAGRAM: [["候选类型与动机解读", "候選型別與動機解讀", "Candidate types and motivation readings"], ["关系模式与成长章节", "關係模式與成長章節", "relationship and growth chapters"]],
  IQ_RAVEN: [["本题本各类推理表现", "本題本各類推理表現", "Performance by reasoning category"], ["结果解读与报告导出", "結果解讀與報告匯出", "result readings and report export"]],
  EQ_60: [["四维详细解释", "四維詳細解釋", "Detailed readings of the four dimensions"], ["交叉解读与日常练习", "交叉解讀與日常練習", "Cross-dimension readings and everyday exercises"]],
  JUNG_ARCHETYPES: [["主导、辅助与接近原型", "主導、輔助與接近原型", "Primary, secondary and nearby archetypes"], ["原型动机、盲区与协作解读", "原型動機、盲區與協作解讀", "Archetype motives, blind spots and collaboration readings"]],
  JUNG_COGNITIVE_FUNCTIONS: [["功能轴与功能栈候选", "功能軸與功能棧候選", "Function axes and stack-fit candidates"], ["功能解读与情境反思", "功能解讀與情境反思", "function readings and situational reflections"]],
  DISC_BEHAVIOR: [["本次选择对应的完整解读", "本次選擇對應的完整解讀", "The complete reading for your choices"], ["行为例子、情境取舍与观察练习", "行為例子、情境取捨與觀察練習", "behavior examples, contextual trade-offs and observation exercises"]],
};

const benefitDetails: Record<string, [string,string,string][]> = {
 MBTI:[["把类型与各组偏好一起看，留意接近中点的分数。","把類型與各組偏好一起看，留意接近中點的分數。","Read your type alongside each preference, including scores near the midpoint."],["结合日常任务、沟通和成长情境，找到值得观察的习惯。","結合日常任務、溝通與成長情境，找到值得觀察的習慣。","Explore work, communication and growth situations to identify habits worth observing."]],
 BIG5_OCEAN:[["分别理解五个连续维度，不把分数当成好坏排名。","分別理解五個連續維度，不把分數當成好壞排名。","Understand each continuous trait without treating scores as a ranking of personal worth."],["阅读该题本支持的细分解释，选择可在生活中检验的下一步。","閱讀該題本支援的細分解釋，選擇可在生活中檢驗的下一步。","Explore the detail available for this form and choose a next step to test in everyday life."]],
 ENNEAGRAM:[["比较候选动机与相近类型，理解本次结果中的不确定性。","比較候選動機與相近類型，理解本次結果中的不確定性。","Compare candidate motives and nearby types, including uncertainty in this result."],["从关系中的反应模式出发，选择一个具体情境继续观察。","從關係中的反應模式出發，選擇一個具體情境繼續觀察。","Explore recurring responses in relationships and choose a concrete situation to observe."]],
 IQ_RAVEN:[["查看本题本实际测到的推理类别，区分正确率与参考分。","查看本題本實際測到的推理類別，區分答對率與參考分。","Explore the reasoning categories measured by this form and distinguish accuracy from reference scores."],["结合计分范围和方法边界，理解本次表现。","結合計分範圍與方法邊界，理解本次表現。","Read this attempt’s performance with its scoring scope and methodological limits."]],
 EQ_60:[["认识自我觉察、情绪调节、共情理解与关系管理的不同线索。","認識自我覺察、情緒調節、共情理解與關係管理的不同線索。","Explore self-awareness, emotion regulation, empathy and relationship management."],["把维度之间的联系放回真实互动，选择低风险的小练习。","把維度之間的聯繫放回真實互動，選擇低風險的小練習。","Connect dimensions with everyday interactions and choose a low-risk practice."]],
 JUNG_ARCHETYPES:[["一起比较领先和相近的原型，避免只靠一个标签理解自己。","一起比較領先與相近的原型，避免只靠一個標籤理解自己。","Compare leading and nearby archetypes rather than relying on a single label."],["对照动机、盲区与协作情境，用真实经历检验这些线索。","對照動機、盲區與協作情境，用真實經歷檢驗這些線索。","Test motives, blind spots and collaboration themes against real experiences."]],
 JUNG_COGNITIVE_FUNCTIONS:[["查看八维之间的相对分布，以及报告给出的候选组合。","查看八維之間的相對分布，以及報告給出的候選組合。","Read the relative distribution of eight functions and the report’s candidate combinations."],["用具体的信息处理和决策情境反思，不把结果当成固定身份。","用具體的資訊處理與決策情境反思，不把結果當成固定身分。","Reflect on information and decision-making situations without treating results as a fixed identity."]],
 DISC_BEHAVIOR:[["理解本次题目内的相对选择，分数不代表人群百分位或能力。","理解本次題目內的相對選擇，分數不代表人群百分位或能力。","Understand relative choices within this questionnaire, not population percentiles or ability."],["把行为例子与实际任务对照，观察不同情境下的取舍。","把行為例子與實際任務對照，觀察不同情境下的取捨。","Compare behavioral examples with real tasks and observe contextual trade-offs."]],
};

const bigFiveGuides: Record<string, [string, string, string]> = {
  O: ["观察你对新想法和陌生体验的兴趣。", "觀察你對新想法和陌生體驗的興趣。", "Look at your interest in new ideas and unfamiliar experiences."],
  C: ["观察你怎么安排任务、跟进计划。", "觀察你怎麼安排任務、跟進計畫。", "Look at how you plan and follow through on tasks."],
  E: ["观察你多常主动找人交流或参与活动。", "觀察你多常主動找人交流或參與活動。", "Look at how often you seek conversation and activity."],
  A: ["观察你在意见不同时怎样顾及彼此。", "觀察你在意見不同時怎樣顧及彼此。", "Look at how you account for others when views differ."],
  N: ["观察压力和不确定性带来的情绪反应。", "觀察壓力和不確定性帶來的情緒反應。", "Look at your emotional responses to pressure and uncertainty."],
};

const profileHeadings: Record<string, [string, string, string]> = {
  BIG5_OCEAN: ["五项人格特质", "五項人格特質", "Five personality traits"],
  ENNEAGRAM: ["九种动机的候选分数", "九種動機的候選分數", "Nine motivation scores"],
  IQ_RAVEN: ["本次推理表现", "本次推理表現", "Reasoning performance"],
  IQ_INTELLIGENCE_QUOTIENT: ["本次推理表现", "本次推理表現", "Reasoning performance"],
  EQ_60: ["四项情商自评维度", "四項情商自評維度", "Four emotional intelligence dimensions"],
  JUNG_ARCHETYPES: ["十二原型的分数分布", "十二原型的分數分布", "Scores across the twelve archetypes"],
  JUNG_COGNITIVE_FUNCTIONS: ["八项认知功能", "八項認知功能", "Eight cognitive functions"],
  DISC_BEHAVIOR: ["四种行为风格的作答分布", "四種行為風格的作答分布", "Response distribution across four styles"],
};

const traitIcons = { O: Palette, C: Target, E: Zap, A: Handshake, N: Waves };
const traitPositions = [[50, 9], [86, 39], [74, 88], [26, 88], [14, 39]];

function ResultRadar({ axes, perimeter = false }: {
  axes: { key: string; label: string; value: number }[];
  perimeter?: boolean;
}) {
  const point = (index: number, fraction: number) => {
    const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
    return [Math.cos(angle), Math.sin(angle)].map(axis => Number((120 + axis * 100 * fraction).toFixed(4)));
  };
  const polygon = (fractions: number[]) => fractions.map((fraction, index) => point(index, fraction).join(",")).join(" ");

  return <div className={perimeter ? styles.perimeterRadar : styles.resultRadar} data-testid={perimeter ? "big-five-trait-radar" : undefined}>
    <svg viewBox="-8 -8 256 256" aria-hidden="true">
      {[.25, .5, .75, 1].map(level => (
        <polygon key={level} points={polygon(axes.map(() => level))} className={styles.radarGrid} />
      ))}
      {axes.map((axis, index) => {
        const [x, y] = point(index, 1);
        const [labelX, labelY] = point(index, 1.16);
        return <g key={axis.key}>
          <line x1="120" y1="120" x2={x} y2={y} className={styles.radarGrid} />
          {!perimeter && <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central">{axis.key}</text>}
        </g>;
      })}
      <polygon points={polygon(axes.map(axis => axis.value / 100))} className={styles.radarProfile} />
      {axes.map((axis, index) => {
        const [x, y] = point(index, axis.value / 100);
        return <circle key={axis.key} cx={x} cy={y} r="3.5" className={styles.radarPoint} data-radar-axis={perimeter ? axis.key : undefined} />;
      })}
    </svg>
    <ul>{axes.map((axis, index) => {
      if (!perimeter) return <li key={axis.key}><span><small>{axis.key}</small> {axis.label}</span><strong>{axis.value}</strong></li>;
      const Icon = traitIcons[axis.key as keyof typeof traitIcons];
      const [left, top] = traitPositions[index];
      return <li key={axis.key} data-radar-axis={axis.key} style={{ left: `${left}%`, top: `${top}%` }}>
        {Icon && <span className={styles.radarTraitIcon} aria-hidden="true"><Icon size={16} strokeWidth={1.8} /></span>}
        <span>{axis.label}</span>
        <strong>{axis.value} / 100</strong>
      </li>;
    })}</ul>
  </div>;
}

function readNonNegativeInteger(value: unknown): number | null {
  const count = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return typeof count === "number" && Number.isSafeInteger(count) && count >= 0 ? count : null;
}

export function MainstreamPaidResult({ data, purchase, locale, children, preview = false, previewArtwork, reasoningPreview, discPreview, traitProfile, previewSampleHref, sampleResultId }: {
  data: ResultResponse | ReportResponse; purchase: RiasecPurchase; locale: DisplayLocale; children?: ReactNode; preview?: boolean; previewArtwork?: string; reasoningPreview?: ReasoningPreview; discPreview?: DiscDesignPreview; traitProfile?: TraitProfilePreview; previewSampleHref?: string; sampleResultId?: string;
}) {
  const [refunded, setRefunded] = useState(false);
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const record = data as unknown as Record<string, unknown>;
  const scale = String(data.meta?.scale_code ?? record.scale_code ?? "");
  const eqUnlock = scale === "EQ_60" ? eqUnlockSchema.safeParse(record.eq60_unlock_v1) : null;
  const liveEq = !preview && eqUnlock?.success ? eqUnlock.data : null;
  if (liveEq && !liveEq.low_confidence) {
    const rows = liveEq.dimensions[locale === "zh" ? "zh-CN" : locale];
    traitProfile = buildEqProfile(rows.map(row => ({code: row.code, standard_score: row.score})), locale);
  }
  const name = names[scale] ?? [scale, scale, scale];
  const paid = purchase.unlocked && !refunded;
  const existing = purchase.order_no && purchase.payment_state !== "canceled";
  const raw = typeof record.result === "object" && record.result !== null ? record.result as Record<string, unknown> : null;
  const scores = raw && typeof raw.scores_pct === "object" && raw.scores_pct ? raw.scores_pct : {};
  const summary = raw && typeof raw.summary === "object" && raw.summary ? raw.summary as Record<string, unknown> : {};
  const iqTotal = isIqScaleCode(scale) ? readNonNegativeInteger(summary.total) : null;
  const iqCorrect = iqTotal === null ? null : readNonNegativeInteger(summary.correct ?? summary.raw_score);
  const liveReasoning = !preview && iqCorrect !== null && iqTotal !== null && iqTotal > 0 && iqCorrect <= iqTotal
    ? { correct: iqCorrect, total: iqTotal, referenceScore: null }
    : null;
  const metrics: Record<string, [string,string,string]> = {
    correct: ["答对题数", "答對題數", "Correct answers"], total: ["总题数", "總題數", "Total questions"],
    percent_correct: ["答题正确率", "答對率", "Answer accuracy"], duration_ms: ["用时（分钟）", "作答時間（分鐘）", "Time taken (minutes)"],
  };
  const labels: Record<string,[string,string,string]> = {EI:["外向—内向","外向—內向","Extraversion–introversion"],SN:["实感—直觉","實感—直覺","Sensing–intuition"],TF:["思考—情感","思考—情感","Thinking–feeling"],JP:["判断—知觉","判斷—知覺","Judging–perceiving"],AT:["附加描述 A/T","附加描述 A/T","Additional A/T dimension"],O:["开放性","開放性","Openness"],C:["尽责性","盡責性","Conscientiousness"],E:["外向性","外向性","Extraversion"],A:["宜人性","宜人性","Agreeableness"],N:["负性情绪","負性情緒","Negative emotionality"],SA:["自我觉察","自我覺察","Self-awareness"],ER:["情绪调节","情緒調節","Emotion regulation"],EM:["共情理解","共情理解","Empathic understanding"],RM:["关系管理","關係管理","Relationship management"]};
  Object.assign(labels, {explorer:["探索者","探索者","Explorer"],lover:["情人","情人","Lover"],creator:["创造者","創造者","Creator"],jester:["弄臣","弄臣","Jester"],ruler:["统治者","統治者","Ruler"],everyperson:["凡人","凡人","Everyperson"],hero:["英雄","英雄","Hero"],caregiver:["照顾者","照顧者","Caregiver"],innocent:["天真者","天真者","Innocent"],sage:["智者","智者","Sage"],magician:["魔法师","魔法師","Magician"],rebel:["反叛者","反叛者","Rebel"],TOTAL:["综合分","綜合分","Overall score"]});
  if (scale === "JUNG_COGNITIVE_FUNCTIONS") Object.assign(labels, {
    Ni: ["内倾直觉", "內傾直覺", "Introverted intuition"], Ne: ["外倾直觉", "外傾直覺", "Extraverted intuition"],
    Si: ["内倾实感", "內傾實感", "Introverted sensing"], Se: ["外倾实感", "外傾實感", "Extraverted sensing"],
    Ti: ["内倾思考", "內傾思考", "Introverted thinking"], Te: ["外倾思考", "外傾思考", "Extraverted thinking"],
    Fi: ["内倾情感", "內傾情感", "Introverted feeling"], Fe: ["外倾情感", "外傾情感", "Extraverted feeling"],
  });
  const discLabels:Record<string,[string,string,string]>={D:["主导","主導","Dominance"],I:["影响","影響","Influence"],S:["稳健","穩健","Steadiness"],C:["审慎","審慎","Conscientiousness"]};
  const label = (key:string) => scale === "DISC_BEHAVIOR" && discLabels[key] ? t(...discLabels[key]) : labels[key] ? t(...labels[key]) : /^T[1-9]$/.test(key) ? t(`候选类型 ${key.slice(1)}`,`候選型別 ${key.slice(1)}`,`Candidate type ${key.slice(1)}`) : key;
  const liveDiscProfile = !preview && scale === "DISC_BEHAVIOR" ? findDiscProfileByCounts(scores) : undefined;
  if (liveDiscProfile) discPreview = buildDiscDesignPreview({ counts: scores, profile: { headline: { [locale]: discPreviewLocales[locale].profiles[liveDiscProfile.id].headline } } }, locale, liveDiscProfile.artwork);
  const previewProfile = Boolean(liveDiscProfile && discPreview) || Boolean(liveEq && traitProfile) || preview && Boolean(previewArtwork || discPreview || traitProfile || scale === "BIG5_OCEAN");
  const scoreEntries = Object.entries(scores).filter(([, value]) => typeof value === "number" && Number.isFinite(value));
  const profileHeading = previewProfile ? profileHeadings[scale] : undefined;
  const axes = scoreEntries.filter(([key]) => key !== "TOTAL").map(([key, value]) => ({
    key, label: label(key), value: Math.round(Math.min(100, Math.max(0, Number(value)))),
  }));
  const disc = previewProfile ? discPreview : undefined;
  const reasoning = previewProfile ? reasoningPreview : undefined;
  const bigFivePreview = previewProfile && scale === "BIG5_OCEAN";
  const topAxis = axes.reduce<(typeof axes)[number] | undefined>((top, axis) => !top || axis.value > top.value ? axis : top, undefined);
  const uniqueTop = topAxis && axes.filter(axis => axis.value === topAxis.value).length === 1 ? topAxis : undefined;
  const resultHeroTitle = uniqueTop
    ? (scale === "ENNEAGRAM" || scale.startsWith("JUNG_") ? uniqueTop.label : t(`${uniqueTop.label}最突出`, `${uniqueTop.label}最突出`, `${uniqueTop.label} stands out`))
    : t("你的人格特质轮廓", "你的人格特質輪廓", "Your trait profile");
  const comparisonPreview = previewProfile && axes.length > 0;
  const previewDimensionLabel = scale === "DISC_BEHAVIOR"
    ? t("本次选择最多的行为风格", "本次選擇最多的行為風格", "Most selected behavior style")
    : scale === "ENNEAGRAM"
      ? t("本次得分最高的候选类型", "本次得分最高的候選型別", "Highest-scoring candidate type")
      : t("本次得分最高的维度", "本次得分最高的維度", "Highest-scoring dimension in this attempt");
  const displayedScores = comparisonPreview && scale !== "DISC_BEHAVIOR" ? [...scoreEntries].sort((a, b) => Number(b[1]) - Number(a[1])) : scoreEntries;
  const detailKey = scale === "IQ_INTELLIGENCE_QUOTIENT" ? "IQ_RAVEN" : scale;
  const lockedLayout = liveReasoning ? `${styles.page} ${styles.reasoningLive}` : styles.page;
  return <div className={paid ? (scale === "JUNG_ARCHETYPES" && locale === "zh" ? "w-full space-y-6" : "mx-auto max-w-6xl px-4 py-8") : lockedLayout} data-result-visible-root data-testid="mainstream-paid-result">
    {purchase.order_no && <CareerRefundPanel orderNo={purchase.order_no} locale={locale} onRefunded={() => setRefunded(true)} />}
    {paid ? children : <>
      <div className={styles.shell}>

      {liveEq?.low_confidence ? <aside role="status" className={styles.section}><h1>{t("本次暂不分类", "本次暫不分類", "No classification this time")}</h1><p>{t("这次作答的信息不足以支持稳定解读。建议在注意力充足时重新作答。", "這次作答的資訊不足以支援穩定解讀。建議在注意力充足時重新作答。", "These responses do not support a stable interpretation. Consider retaking when you have enough time and attention.")}</p></aside> : liveReasoning ? <ReasoningUnlockSummary result={liveReasoning} locale={locale} durationMs={readNonNegativeInteger(summary.duration_ms) ?? undefined} live /> : reasoning ? <ReasoningUnlockPreview result={reasoning} locale={locale} /> : disc ? <DiscUnlockPreview result={disc} locale={locale} /> : (preview || liveEq) && traitProfile ? <TraitProfileUnlockPreview profile={traitProfile} locale={locale} /> : <>
      <header className={comparisonPreview ? `${styles.hero} ${styles.traitResultHero}` : styles.hero}>
        {!bigFivePreview && <p className={styles.eyebrow}>{t(...name)}{comparisonPreview && t(" · 测评结果", " · 測驗結果", " · Assessment result")}</p>}
        {!previewProfile && <p className={styles.sectionLabel}>{t("你的测评结果", "你的測評結果", "YOUR ASSESSMENT RESULT")}</p>}
        <h1>{comparisonPreview ? resultHeroTitle : typeof raw?.type_code === "string" ? raw.type_code : previewProfile && typeof summary.percent_correct === "number"
          ? `${summary.percent_correct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
          : t(...name)}</h1>
        <p className={styles.heroLine}>{comparisonPreview ? (uniqueTop ? `${uniqueTop.key} · ${previewDimensionLabel}` : t("本次分数轮廓", "本次分數輪廓", "Score profile")) : previewProfile && scale.startsWith("IQ_") ? t("本次答题正确率", "本次答對率", "Answer accuracy for this attempt") : t("从本次作答出发，看懂自己的倾向，找到下一步值得观察的方向。", "從本次作答出發，看懂自己的傾向，找到下一步值得觀察的方向。", "Understand the patterns in your answers and find a practical direction to explore.")}</p>
        {!previewProfile && <div className={styles.art} aria-hidden="true">{["MBTI","EQ_60","DISC_BEHAVIOR"].includes(scale) ? <Image src={scale === "MBTI" ? "/images/mbti/ai-result-conversation.webp" : scale === "DISC_BEHAVIOR" ? "/images/test-covers/disc.webp" : "/images/test-covers/eq-dashboard.webp"} width={400} height={400} alt=""/> : <div className="relative mx-auto flex aspect-square w-full items-center justify-center rounded-full border border-purple-300/20 bg-purple-500/10"><div className="absolute inset-6 rotate-45 rounded-[30%] border border-purple-300/30"/><div className="absolute inset-12 rounded-full border border-purple-300/40"/>{scale.startsWith("IQ_")?<Brain size={120} strokeWidth={.8}/>:scale==="BIG5_OCEAN"?<Flower2 size={120} strokeWidth={.8}/>:scale==="ENNEAGRAM"?<Network size={120} strokeWidth={.8}/>:<Compass size={120} strokeWidth={.8}/>}</div>}</div>}
        {!previewProfile && <a className={styles.heroCta} href="#mainstream-purchase">{t("探索我的完整报告", "探索我的完整報告", "Explore my full report")}<ArrowDown size={17}/></a>}
      </header>
      <section className={styles.section}>
        {comparisonPreview
          ? <h2 className={styles.traitComparisonTitle}>{bigFivePreview ? t("你的各项特质之间的比较", "你的各項特質之間的比較", "How your traits compare") : profileHeading && t(...profileHeading)}</h2>
          : <div className={styles.sectionHeading}><span>01</span><div><p>{t("本次作答概览", "本次作答概覽", "YOUR RESULTS AT A GLANCE")}</p><h2>{profileHeading ? t(...profileHeading) : t("从这些线索，认识自己", "從這些線索，認識自己", "Start with the patterns in your answers")}</h2></div></div>}
        {previewProfile && (scale === "BIG5_OCEAN" || scale === "EQ_60") && axes.length > 2 && (
          <ResultRadar axes={axes} perimeter={bigFivePreview && axes.length === 5} />
        )}
        {comparisonPreview && !bigFivePreview && uniqueTop && <div className={styles.previewSummary}>
          <div className={styles.traitScoreCallout}>
            {scale === "DISC_BEHAVIOR" ? t("本次作答选择最多", "本次作答選擇最多", "Most selected in this attempt") : t("本次作答最高分", "本次作答最高分", "Highest score in this attempt")}
            <strong>{uniqueTop.label} {uniqueTop.value}{scale === "DISC_BEHAVIOR" ? t(" 次", " 次", " selections") : " / 100"}</strong>
          </div>
        </div>}
        {bigFivePreview && <div className={styles.previewSummary}>
          {uniqueTop && <div className={styles.traitScoreCallout}>
            {t("本次作答最高分", "本次作答最高分", "Highest score in this attempt")}
            <strong>{uniqueTop.label} {uniqueTop.value} / 100</strong>
          </div>}
          <p>{uniqueTop && bigFiveGuides[uniqueTop.key] ? t(...bigFiveGuides[uniqueTop.key]) : t(
            "比较五项特质的分数，看看哪些倾向在本次作答中更明显。",
            "比較五項特質的分數，看看哪些傾向在本次作答中更明顯。",
            "Compare the five scores to see which tendencies stand out in this attempt.",
          )}</p>
          <Link className={styles.traitMethodLink} href={displayNavigationPath("/personality/big-five/methodology", locale)}>
            {t("了解计分方法", "了解計分方法", "How scoring works")}<ArrowUpRight size={13} />
          </Link>
        </div>}
        {bigFivePreview ? <div className={styles.traitBreakdownHeading}>
          <h3>{t("你的大五人格档案", "你的大五人格檔案", "Your Big Five profile")}</h3>
          <p>{t("各项特质在 0–100 量表上的位置", "各項特質在 0–100 量表上的位置", "Where each trait sits on the 0–100 scale")}</p>
        </div> : previewProfile && scale === "EQ_60" && axes.length > 2 && (
          <h3 className={styles.profileBreakdown}>{t("逐项查看分数", "逐項查看分數", "Score breakdown")}</h3>
        )}
        <dl className={comparisonPreview ? styles.previewTraitCards : styles.scores}>{displayedScores.map(([key, value]) => {
          const width = Math.min(100, Math.max(0, Number(value) / (scale === "DISC_BEHAVIOR" ? 24 : 100) * 100));
          return <div key={key} data-axis={comparisonPreview ? key : undefined} style={{ padding: ".8rem 0" }}>
            <dt>{comparisonPreview && <span className={styles.previewTraitIcon} aria-hidden="true">{key}</span>}{label(key)}</dt>
            <dd className={comparisonPreview ? styles.previewTraitScore : undefined} style={{ float: "right" }}>
              {Number(value).toLocaleString(locale, { maximumFractionDigits: 1 })}{bigFivePreview && <small> / 100</small>}
            </dd>
            <dd className={comparisonPreview ? styles.previewTraitMeter : undefined} aria-hidden="true">
              <span className={styles.track} style={{ display: "block", marginTop: 12 }}><i style={{ width: `${width}%` }} /></span>
              {comparisonPreview && <><i className={styles.previewTraitPin} style={{ left: `clamp(7px, ${width}%, calc(100% - 7px))` }} />
                <span className={styles.previewScale}><span>0</span><span>{scale === "DISC_BEHAVIOR" ? 12 : 50}</span><span>{scale === "DISC_BEHAVIOR" ? 24 : 100}</span></span></>}
            </dd>
            {bigFivePreview && bigFiveGuides[key] && <dd className={styles.previewTraitNote}>{t(...bigFiveGuides[key])}</dd>}
          </div>;
        })}</dl>
        <dl className="mt-6 grid grid-cols-2 gap-6">{Object.entries(metrics).filter(([key])=>typeof summary[key] === "number").map(([key,label])=><div key={key}><dt className={styles.muted}>{t(...label)}</dt><dd className="mt-2 text-3xl">{Number(key === "duration_ms" ? Number(summary[key])/60000 : summary[key]).toLocaleString(locale,{maximumFractionDigits:1})}{key === "percent_correct" ? "%" : ""}</dd></div>)}</dl>
        <p className={styles.scoreNote}>{t("结果反映本次作答，请结合具体经历和测评方法说明阅读。", "結果反映本次作答，請結合具體經歷與測評方法說明閱讀。", "These results reflect this attempt. Read them alongside your experiences and the assessment’s method and limitations.")}</p>
        {scale.startsWith("IQ_") && <p className={styles.scoreNote}>{t("推理练习不替代专业智力评估；付费不会改变计分或常模适用范围。", "推理練習不替代專業智力評估；付費不會改變計分或常模適用範圍。", "Payment does not change scoring or the applicability of norms.")}</p>}
      </section></>}
      {previewProfile && previewArtwork && !reasoning && !traitProfile && !bigFivePreview && <div className={styles.profileIllustration} aria-hidden="true">
        <Image src={previewArtwork} width={640} height={440} sizes="(max-width: 760px) 85vw, 640px" alt="" />
      </div>}
      {previewProfile && <ResultPreviewChapters locale={locale} offerId="mainstream-purchase" showJobExamples={bigFivePreview || Boolean(reasoning || disc || traitProfile)} careerProfile={disc ? "disc" : traitProfile?.kind}
        showProgress={!reasoning} insightTitle={reasoning ? t("这对你意味着什么", "這對你意味著什麼", "What this means for you") : undefined} insights={
        bigFivePreview && uniqueTop && bigFiveGuides[uniqueTop.key]
          ? [t(...bigFiveGuides[uniqueTop.key]), t("回想一个类似倾向不明显的场景，看看改变它的是任务、环境还是身边的人。", "回想一個類似傾向不明顯的場景，看看改變它的是任務、環境還是身邊的人。", "Recall a situation where the tendency was less visible. What differed about the task, setting or people?")]
          : (benefitDetails[detailKey] ?? []).map(copy => t(...copy))
      } />}
      <section id="mainstream-purchase" className={styles.offer} aria-labelledby="paid-report-heading">
        <span className={styles.offerIcon}><LockKeyhole size={26}/></span>
        <p className={styles.eyebrow}>{t("从结果线索，到日常应用", "從結果線索，到日常應用", "FROM RESULTS TO EVERYDAY LIFE")}</p>
        <h2 id="paid-report-heading">{t(...name)} · {t("深度报告", "深度報告", "Full report")}</h2>
        <p className={styles.offerIntro}>{t("不止看见分数，更理解它与你的生活有什么联系。", "不只看見分數，更理解它與你的生活有什麼聯繫。", "Go beyond the scores and explore what they mean in everyday life.")}</p>
        <ul className={styles.benefits}>{(sections[scale === "IQ_INTELLIGENCE_QUOTIENT" ? "IQ_RAVEN" : scale] ?? []).map((copy,i)=><li key={i}>{i ? <BookOpen size={24}/> : <BarChart3 size={24}/>}<div><strong>{t(...copy)}</strong><p>{t(...benefitDetails[scale === "IQ_INTELLIGENCE_QUOTIENT" ? "IQ_RAVEN" : scale][i])}</p></div></li>)}</ul>
        <div className={styles.purchaseSlot}>
        {preview ? <><p className={styles.scoreNote}>{t("本地样式预览 · 模拟分数 · 不创建订单", "本機樣式預覽 · 模擬分數 · 不建立訂單", "Local design preview · synthetic scores · no orders")}</p>{[t("微信支付 · ¥2.99", "微信支付 · ¥2.99", "WeChat Pay · ¥2.99"),t("支付宝 · ¥2.99", "支付寶 · ¥2.99", "Alipay · ¥2.99"),t("海外银行卡 · US$2.99", "海外銀行卡 · US$2.99", "International card · US$2.99")].map(label=><button key={label} disabled className="my-2">{label}</button>)}</> : existing ? <p role="status">{refunded || purchase.payment_state === "refunded" ? t("此订单已退款，付费报告访问已停止。", "此訂單已退款，付費報告存取已停止。", "This order was refunded. Access to the paid report has ended.") : t("此报告已有订单，可查看支付和退款进度。", "此報告已有訂單，可查看付款與退款進度。", "This report has an existing order. Check its payment or refund status.")}{" "}<Link className="underline" href={`/${locale}/pay/wait?order_no=${encodeURIComponent(purchase.order_no!)}`}>{t("查看订单", "查看訂單", "View order")}</Link></p>
          : purchase.offers.length ? <Career94Checkout locale={locale === "en" ? "en" : "zh"} displayLocale={locale} attemptId={purchase.attempt_id} offers={purchase.offers} />
            : <p role="status">{t("本次结果暂不提供购买，请稍后重试。", "本次結果暫不提供購買，請稍後重試。", "Purchasing is unavailable for this result. Please try again later.")}</p>}
        </div>
        {previewProfile && <p className={styles.scoreNote}><Link href={displayNavigationPath("/help/payment-refund", locale)}>{t("查看付款与退款说明", "查看付款與退款說明", "Payment and refund information")}</Link></p>}
        <Link className={styles.sampleLink} href={preview && previewSampleHref ? previewSampleHref : `/${locale}/reports/samples/${({MBTI:"mbti",BIG5_OCEAN:"big5",ENNEAGRAM:"enneagram",IQ_RAVEN: iqTotal === 40 ? "iq40" : "iq30",IQ_INTELLIGENCE_QUOTIENT: iqTotal === 30 ? "iq30" : "iq40",EQ_60:"eq",JUNG_ARCHETYPES:"archetypes",JUNG_COGNITIVE_FUNCTIONS:"cognitive",DISC_BEHAVIOR:"disc"} as Record<string,string>)[scale]}${scale === "DISC_BEHAVIOR" && sampleResultId ? `?result=${encodeURIComponent(sampleResultId)}` : ""}`}>{t("查看完整示例报告", "查看完整示例報告", "View the complete sample report")} ↗</Link>
      </section>
      </div>
    </>}
  </div>;
}
