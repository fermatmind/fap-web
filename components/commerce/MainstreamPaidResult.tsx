"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, BarChart3, BookOpen, LockKeyhole, Brain, Compass, Flower2, Network } from "lucide-react";
import styles from "@/components/career/unlock-report-experience.module.css";
import { useState, type ReactNode } from "react";
import type { ReportResponse, ResultResponse, RiasecPurchase } from "@/lib/api/v0_3";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { Career94Checkout } from "@/app/(localized)/[locale]/career/assessment/Career94Purchase";
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
  EQ_60: [["四维详细解释", "四維詳細解釋", "Detailed readings of the four dimensions"], ["交叉解读与日常练习", "交叉解讀與日常練習", "cross-dimension readings and everyday exercises"]],
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

export function MainstreamPaidResult({ data, purchase, locale, children, preview = false }: {
  data: ResultResponse | ReportResponse; purchase: RiasecPurchase; locale: DisplayLocale; children?: ReactNode; preview?: boolean;
}) {
  const [refunded, setRefunded] = useState(false);
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const record = data as unknown as Record<string, unknown>;
  const scale = String(data.meta?.scale_code ?? record.scale_code ?? "");
  const name = names[scale] ?? [scale, scale, scale];
  const paid = purchase.unlocked && !refunded;
  const existing = purchase.order_no && purchase.payment_state !== "canceled";
  const raw = typeof record.result === "object" && record.result !== null ? record.result as Record<string, unknown> : null;
  const scores = raw && typeof raw.scores_pct === "object" && raw.scores_pct ? raw.scores_pct : {};
  const summary = raw && typeof raw.summary === "object" && raw.summary ? raw.summary as Record<string, unknown> : {};
  const metrics: Record<string, [string,string,string]> = {
    correct: ["答对题数", "答對題數", "Correct answers"], total: ["总题数", "總題數", "Total questions"],
    percent_correct: ["答题正确率", "答對率", "Answer accuracy"], duration_ms: ["用时（分钟）", "作答時間（分鐘）", "Time taken (minutes)"],
  };
  const labels: Record<string,[string,string,string]> = {EI:["外向—内向","外向—內向","Extraversion–introversion"],SN:["实感—直觉","實感—直覺","Sensing–intuition"],TF:["思考—情感","思考—情感","Thinking–feeling"],JP:["判断—知觉","判斷—知覺","Judging–perceiving"],AT:["附加描述 A/T","附加描述 A/T","Additional A/T dimension"],O:["开放性","開放性","Openness"],C:["尽责性","盡責性","Conscientiousness"],E:["外向性","外向性","Extraversion"],A:["宜人性","宜人性","Agreeableness"],N:["负性情绪","負性情緒","Negative emotionality"],SA:["自我觉察","自我覺察","Self-awareness"],ER:["情绪调节","情緒調節","Emotion regulation"],EM:["共情理解","共情理解","Empathic understanding"],RM:["关系管理","關係管理","Relationship management"]};
  Object.assign(labels, {explorer:["探索者","探索者","Explorer"],lover:["情人","情人","Lover"],creator:["创造者","創造者","Creator"],jester:["弄臣","弄臣","Jester"],ruler:["统治者","統治者","Ruler"],everyperson:["凡人","凡人","Everyperson"],hero:["英雄","英雄","Hero"],caregiver:["照顾者","照顧者","Caregiver"],innocent:["天真者","天真者","Innocent"],sage:["智者","智者","Sage"],magician:["魔法师","魔法師","Magician"],rebel:["反叛者","反叛者","Rebel"],TOTAL:["综合分","綜合分","Overall score"]});
  const discLabels:Record<string,[string,string,string]>={D:["主导","主導","Dominance"],I:["影响","影響","Influence"],S:["稳健","穩健","Steadiness"],C:["审慎","審慎","Conscientiousness"]};
  const label = (key:string) => scale === "DISC_BEHAVIOR" && discLabels[key] ? t(...discLabels[key]) : labels[key] ? t(...labels[key]) : /^T[1-9]$/.test(key) ? t(`候选类型 ${key.slice(1)}`,`候選型別 ${key.slice(1)}`,`Candidate type ${key.slice(1)}`) : key;
  return <div className={paid ? "mx-auto max-w-6xl px-4 py-8" : styles.page} data-result-visible-root data-testid="mainstream-paid-result">
    {purchase.order_no && <CareerRefundPanel orderNo={purchase.order_no} locale={locale} onRefunded={() => setRefunded(true)} />}
    {paid ? children : <>
      <div className={styles.shell}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t(...name)}</p>
        <p className={styles.sectionLabel}>{t("你的测评结果", "你的測評結果", "YOUR ASSESSMENT RESULT")}</p>
        <h1>{typeof raw?.type_code === "string" ? raw.type_code : t(...name)}</h1>
        <p className={styles.heroLine}>{t("从本次作答出发，看懂自己的倾向，找到下一步值得观察的方向。", "從本次作答出發，看懂自己的傾向，找到下一步值得觀察的方向。", "Understand the patterns in your answers and find a practical direction to explore.")}</p>
        <div className={styles.art} aria-hidden="true">{["MBTI","EQ_60","DISC_BEHAVIOR"].includes(scale) ? <Image src={scale === "MBTI" ? "/images/mbti/ai-result-conversation.webp" : scale === "DISC_BEHAVIOR" ? "/images/test-covers/disc.webp" : "/images/test-covers/eq-dashboard.webp"} width={400} height={400} alt=""/> : <div className="relative mx-auto flex aspect-square w-full items-center justify-center rounded-full border border-purple-300/20 bg-purple-500/10"><div className="absolute inset-6 rotate-45 rounded-[30%] border border-purple-300/30"/><div className="absolute inset-12 rounded-full border border-purple-300/40"/>{scale.startsWith("IQ_")?<Brain size={120} strokeWidth={.8}/>:scale==="BIG5_OCEAN"?<Flower2 size={120} strokeWidth={.8}/>:scale==="ENNEAGRAM"?<Network size={120} strokeWidth={.8}/>:<Compass size={120} strokeWidth={.8}/>}</div>}</div>
        <a className={styles.heroCta} href="#mainstream-purchase">{t("探索我的完整报告", "探索我的完整報告", "Explore my full report")}<ArrowDown size={17}/></a>
      </header>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><span>01</span><div><p>{t("本次作答概览", "本次作答概覽", "YOUR RESULTS AT A GLANCE")}</p><h2>{t("从这些线索，认识自己", "從這些線索，認識自己", "Start with the patterns in your answers")}</h2></div></div>
        <dl className={styles.scores}>{Object.entries(scores).filter(([,v])=>typeof v === "number" && Number.isFinite(v)).map(([key,value])=><div key={key} style={{padding:".8rem 0"}}><dt>{label(key)}</dt><dd style={{float:"right"}}>{Number(value).toLocaleString(locale,{maximumFractionDigits:1})}</dd><span className={styles.track} style={{display:"block",marginTop:12}}><i style={{width:`${Math.min(100,Math.max(0,Number(value)/(scale === "DISC_BEHAVIOR" ? 24 : 100)*100))}%`}}/></span></div>)}</dl>
        <dl className="mt-6 grid grid-cols-2 gap-6">{Object.entries(metrics).filter(([key])=>typeof summary[key] === "number").map(([key,label])=><div key={key}><dt className={styles.muted}>{t(...label)}</dt><dd className="mt-2 text-3xl">{Number(key === "duration_ms" ? Number(summary[key])/60000 : summary[key]).toLocaleString(locale,{maximumFractionDigits:1})}{key === "percent_correct" ? "%" : ""}</dd></div>)}</dl>
        <p className={styles.scoreNote}>{t("结果反映本次作答，请结合具体经历和测评方法说明阅读。", "結果反映本次作答，請結合具體經歷與測評方法說明閱讀。", "These results reflect this attempt. Read them alongside your experiences and the assessment’s method and limitations.")}</p>
        {scale.startsWith("IQ_") && <p className={styles.scoreNote}>{t("推理练习不替代专业智力评估；付费不会改变计分或常模适用范围。", "推理練習不替代專業智力評估；付費不會改變計分或常模適用範圍。", "Payment does not change scoring or the applicability of norms.")}</p>}
      </section>
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
        <Link className={styles.sampleLink} href={`/${locale}/reports/samples/${({MBTI:"mbti",BIG5_OCEAN:"big5",ENNEAGRAM:"enneagram",IQ_RAVEN: summary.total === 40 ? "iq40" : "iq30",IQ_INTELLIGENCE_QUOTIENT:"iq40",EQ_60:"eq",JUNG_ARCHETYPES:"archetypes",JUNG_COGNITIVE_FUNCTIONS:"cognitive",DISC_BEHAVIOR:"disc"} as Record<string,string>)[scale]}`}>{t("查看完整示例报告", "查看完整示例報告", "View the complete sample report")} ↗</Link>
      </section>
      </div>
    </>}
  </div>;
}
