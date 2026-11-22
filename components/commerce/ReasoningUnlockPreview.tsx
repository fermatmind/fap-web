import { BookOpen, ChartNoAxesColumnIncreasing, Grid2X2, Hash, LockKeyhole, UserRound } from "lucide-react";
import Image from "next/image";
import { ScoreDistribution } from "@/components/result/iq/IqResultShell";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "@/components/career/unlock-report-experience.module.css";

export type ReasoningPreview = {
  correct: number;
  referenceScore: number | null;
  total: number;
  categories: { code: string; label: string; items: number; correct: number }[];
};

// User-supplied JobCannon example, separate from the FermatMind form result.
const examplePeople = [
  { slug: "bruce-lee", name: ["李小龙", "李小龍", "Bruce Lee"], role: ["武术家、演员、哲学家", "武術家、演員、哲學家", "Martial artist, actor and philosopher"], score: 132 },
  { slug: "william-shakespeare", name: ["威廉·莎士比亚", "威廉·莎士比亞", "William Shakespeare"], role: ["剧作家及诗人", "劇作家及詩人", "Playwright and poet"], score: 132 },
  { slug: "vincent-van-gogh", name: ["文森特·梵高", "文森·梵谷", "Vincent van Gogh"], role: ["艺术家", "藝術家", "Artist"], score: 130 },
  { slug: "abraham-lincoln", name: ["亚伯拉罕·林肯", "亞伯拉罕·林肯", "Abraham Lincoln"], role: ["总统", "總統", "President"], score: 130 },
] as const;

const exampleRegions = [
  { name: ["台湾", "台灣", "Taiwan"], percentage: 82.9 },
  { name: ["希腊", "希臘", "Greece"], percentage: 76.4 },
  { name: ["澳大利亚", "澳洲", "Australia"], percentage: 75.3 },
  { name: ["日本", "日本", "Japan"], percentage: 74.1 },
  { name: ["新西兰", "紐西蘭", "New Zealand"], percentage: 73.9 },
  { name: ["你 · #10/56", "你 · #10/56", "You · #10/56"], percentage: 72, current: true },
] as const;

const exampleCategories = [
  { label: ["数值推理", "數值推理", "Numerical reasoning"], rating: ["杰出", "傑出", "Outstanding"], correct: 5, icon: Hash },
  { label: ["语言推理", "語文推理", "Verbal reasoning"], rating: ["强", "強", "Strong"], correct: 4, icon: BookOpen },
  { label: ["逻辑推理", "邏輯推理", "Logical reasoning"], rating: ["仍有进步空间", "仍有進步空間", "Room to improve"], correct: 2, icon: Grid2X2 },
  { label: ["模式识别", "模式辨識", "Pattern recognition"], rating: ["强", "強", "Strong"], correct: 4, icon: ChartNoAxesColumnIncreasing },
] as const;

function examplePortrait(slug: string) {
  const path = encodeURIComponent(`/images/famous/${slug}.webp?v=2`);
  return `https://jobcannon.io/_next/image?url=${path}&w=256&q=75&dpl=dpl_GPjXFx65FAuYNtK9X7zgio83L8r7`;
}

// A theoretical comparison using the displayed score. This is not a test-taker percentile.
function hypotheticalIqPercentile(score: number) {
  const z = (score - 100) / 15;
  const x = Math.abs(z);
  // Same normal CDF approximation as the IQ reference-score service.
  const t = 1 / (1 + 0.2316419 * x);
  const tail = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI)
    * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return Math.round(100 * (z >= 0 ? 1 - tail : tail));
}

export function ReasoningUnlockSummary({ result, locale, durationMs, live }: {
  result: Pick<ReasoningPreview, "correct" | "total" | "referenceScore">;
  locale: DisplayLocale;
  durationMs?: number;
  live?: boolean;
}) {
  const languageIndex = locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0;
  const t = (zh: string, tw: string, en: string) => [zh, tw, en][languageIndex];
  const accuracy = result.total > 0 ? result.correct / result.total * 100 : 0;
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const accuracyText = `${format.format(accuracy)}%`;
  const referenceScore = result.referenceScore;
  const hasReferenceScore = referenceScore !== null;
  const hypotheticalPercentile = hasReferenceScore ? hypotheticalIqPercentile(referenceScore) : null;
  const correctText = t(`${result.total} 题中答对 ${result.correct} 题`, `${result.total} 題中答對 ${result.correct} 題`, `${result.correct} correct out of ${result.total} questions`);
  const accuracyLabel = t("答题正确率", "作答正確率", "Answer accuracy");
  return (
    <header className={`${styles.hero} ${styles.reasoningPreviewHero}`} data-testid="reasoning-preview-score">
      <div className={styles.reasoningHeadline}>
        <p className={styles.eyebrow}>{hasReferenceScore
          ? t("IQ 模型参考分", "IQ 模型參考分", "IQ model reference score")
          : t("矩阵推理测试 · 本次结果", "矩陣推理測驗 · 本次結果", "Matrix reasoning · Your result")}</p>
        <h1>{hasReferenceScore ? format.format(referenceScore) : accuracyText}</h1>
        <p>{correctText} · {accuracyLabel} {accuracyText}</p>
        {durationMs !== undefined && <p>
          {t("用时", "作答時間", "Time taken")} · {format.format(durationMs / 60000)} {t("分钟", "分鐘", "min")}
        </p>}
        {live && <>
          <p>{t(
            "正确率只反映这次推理测试的作答表现。解锁完整报告后，结果沿用相同的计分规则。",
            "正確率只反映這次推理測驗的作答表現。解鎖完整報告後，結果沿用相同的計分規則。",
            "Accuracy reflects your performance on this reasoning test. The full report uses the same scoring rules.",
          )}</p>
          <a className={styles.heroCta} href="#mainstream-purchase">
            {t("探索我的完整报告", "探索我的完整報告", "Explore my full report")}
          </a>
        </>}
      </div>
      {hasReferenceScore && <div className={styles.reasoningModel}>
        <p className={styles.reasoningModelNote}>{t(
          `在平均值为 100、标准差为 15 的假设分布上，这一参考分位于约第 ${hypotheticalPercentile} 百分位。该位置仅用于读图，实际人群排名未知。`,
          `在平均值為 100、標準差為 15 的假設分布上，這一參考分位於約第 ${hypotheticalPercentile} 百分位。該位置僅供讀圖，實際人群排名未知。`,
          `On a hypothetical distribution with a mean of 100 and standard deviation of 15, this score sits around the ${hypotheticalPercentile}th percentile. This illustrates the chart only. Your population rank is unknown.`,
        )}</p>
        <ScoreDistribution score={referenceScore} locale={locale === "en" ? "en" : "zh"} displayLocale={locale} showValue={false} showCaption={false} />
      </div>}
    </header>
  );
}

export function ReasoningUnlockPreview({ result, locale, durationMs, live = false }: {
  result: ReasoningPreview;
  locale: DisplayLocale;
  durationMs?: number;
  live?: boolean;
}) {
  const languageIndex = locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0;
  const t = (zh: string, tw: string, en: string) => [zh, tw, en][languageIndex];
  const accuracy = result.correct / result.total * 100;
  const liveCategories = [
    { label: t("视觉空间洞察", "視覺空間洞察", "Visual-spatial insight"), icon: Grid2X2 },
    { label: t("视觉空间模式推理", "視覺空間模式推理", "Visual-spatial pattern reasoning"), icon: ChartNoAxesColumnIncreasing },
    { label: t("数字规律推理", "數字規律推理", "Numerical pattern reasoning"), icon: Hash },
  ];
  const currentValue = result.referenceScore ?? ((result.correct / result.total) * 100);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return <>
    <ReasoningUnlockSummary result={result} locale={locale} durationMs={durationMs} />
    <div className={styles.reasoningDetails} id={live ? "reasoning-example" : undefined} aria-labelledby={live ? "reasoning-reference" : "reasoning-example"}>
      {!live && <div className={styles.reasoningPanel}>
        <h2 id="reasoning-example">{t("JobCannon 对标示例", "JobCannon 對標示例", "JobCannon reference example")}</h2>
        <p>{t("以下使用你提供的示例资料。人物分数和地区排名使用示例资料。人物列表最后一行显示本次费马测试结果。", "以下使用你提供的示例資料。人物分數和地區排名使用示例資料。人物列表最後一列顯示本次費馬測驗結果。", "Profile scores and regional rankings come from the supplied example. The last profile row shows this FermatMind result.")}</p>
      </div>}
      <section className={styles.reasoningPanel} aria-labelledby="reasoning-reference">
        <h2 id="reasoning-reference">{t("人物分数对照", "人物分數對照", "Profile score comparison")}</h2>
        <ul className={styles.reasoningPeople}>
          {examplePeople.map(({ slug, name, role, score }) => <li key={slug}>
            <span className={styles.reasoningAvatar} aria-hidden="true">
              <Image unoptimized src={examplePortrait(slug)} alt="" width={38} height={38} />
            </span>
            <div><strong>{name[languageIndex]}</strong><small>{role[languageIndex]}</small></div>
            <strong className={styles.reasoningComparisonValue}>{score}</strong>
          </li>)}
          <li data-current>
            <span className={styles.reasoningAvatar} aria-hidden="true"><UserRound size={20} /></span>
            <div><strong>{t("你", "你", "You")}</strong><small>{t("本次测试结果", "本次測驗結果", "This test result")}</small></div>
            <strong className={styles.reasoningComparisonValue}>{format.format(currentValue)}{result.referenceScore === null ? "%" : ""}</strong>
          </li>
        </ul>
      </section>
      <section className={styles.reasoningPanel} aria-labelledby="reasoning-regions">
        <h2 id="reasoning-regions">{t("各国平均分排名", "各國平均分排名", "Average scores by country and region")}</h2>
        <p>{t(
          live ? "以下百分比为示例中的地区平均正确率，本次答题正确率单独列出。" : "示例纳入至少有 300 人参加 JobCannon 测试的国家和地区，按平均答题正确率对照。",
          live ? "以下百分比為示例中的地區平均正確率，本次作答正確率單獨列出。" : "示例納入至少有 300 人參加 JobCannon 測驗的國家和地區，依平均作答正確率對照。",
          live ? "The example lists regional average accuracy. Your own accuracy is shown separately." : "The example compares average accuracy in countries and regions with at least 300 JobCannon test-takers.",
        )}</p>
        <ul className={styles.reasoningRegions}>
          {exampleRegions.filter(row => !live || !("current" in row)).map(row => <li key={row.name[0]} data-current={"current" in row || undefined}>
            <div><strong>{row.name[languageIndex]}</strong><strong>{row.percentage}%</strong></div>
            <div className={styles.reasoningComposition} aria-hidden="true"><span style={{ width: `${row.percentage}%` }} /></div>
          </li>)}
        </ul>
        {live && <p>{t("本次答题正确率", "本次作答正確率", "Your answer accuracy")} · {format.format(accuracy)}%</p>}
      </section>
      <section className={styles.reasoningPanel} aria-labelledby="reasoning-profile">
        <h2 id="reasoning-profile">{t("你的认知档案", "你的認知檔案", "Your cognitive profile")}</h2>
        <p>{live ? t(
          `你在这份 ${result.total} 题的题本中答对了 ${result.correct} 题。完整报告可查看各类推理题的表现。`,
          `你在這份 ${result.total} 題的題本中答對了 ${result.correct} 題。完整報告可查看各類推理題的表現。`,
          `You answered ${result.correct} of ${result.total} questions correctly. The full report breaks down performance by reasoning category.`,
        ) : t(
          "寻求智力上有挑战的追求：竞争编程、高等数学、战略游戏精通（国际象棋、围棋）或你关心的领域的原始研究。你的思维在复杂性和细节的范围上茁壮成长，低估自己实际上是浪费潜力。考虑指导他人或发布你思维的见解。",
          "尋求智力上的挑戰，例如競賽程式設計、高等數學、策略遊戲（西洋棋、圍棋），或在你關心的領域做原創研究。你喜歡處理複雜問題和細節，也可以考慮指導他人或分享自己的見解。",
          "Try intellectually demanding activities such as competitive programming, advanced mathematics, strategy games, or original research in a subject you care about. Consider mentoring someone or publishing your own insights.",
        )}</p>
      </section>
      <section className={styles.reasoningPanel} aria-labelledby="reasoning-categories">
        <h2 id="reasoning-categories">{t("认知能力分解", "認知能力分解", "Cognitive ability breakdown")}</h2>
        {live ? <>
      <ul className={styles.reasoningCategories}>
        {liveCategories.map(({ label, icon: Icon }) => <li key={label}>
          <div><Icon size={18} aria-hidden="true" /><strong>{label}</strong><span>{t("解锁后查看", "解鎖後查看", "Available after unlock")}</span></div>
          <div className={styles.reasoningComposition} aria-hidden="true" />
        </li>)}
      </ul>
      <ul className={styles.reasoningReading}>
        <li><LockKeyhole size={18} aria-hidden="true" /><div><strong>{t("查看各类题目的正确率", "查看各類題目的正確率", "See accuracy by category")}</strong><p>{t("完整报告会按推理类别展示答对题数和题量。", "完整報告會按推理類別展示答對題數和題量。", "The full report shows the number correct and total questions for each reasoning category.")}</p></div></li>
      </ul>
        </> : <>
        <ul className={styles.reasoningCategories}>
          {exampleCategories.map(({ label, rating, correct, icon: Icon }) => <li key={label[0]}>
            <div><Icon size={18} aria-hidden="true" /><strong>{label[languageIndex]}</strong><span>{rating[languageIndex]} · {t(`5题中答对${correct}题`, `5題中答對${correct}題`, `${correct} of 5 correct`)}</span></div>
            <div className={styles.reasoningComposition} aria-hidden="true"><span style={{ width: `${correct * 20}%` }} /></div>
          </li>)}
        </ul>
        <ul className={styles.reasoningReading}>
          <li><span aria-hidden="true">⚡</span><div><strong>{t("你最强的一面是数值推理。", "你最強的一面是數值推理。", "Your strongest area is numerical reasoning.")}</strong><p>{t("这是你思维最敏捷的地方——你比大多数人更快地发现规律和找到答案。", "在這一類題目中，你能很快發現規律並找到答案。", "This is where you spot patterns and find answers fastest.")}</p></div></li>
          <li><span aria-hidden="true">🌱</span><div><strong>{t("逻辑推理是你进步最大的方向。", "邏輯推理是你最有進步空間的方向。", "Logical reasoning has the most room for improvement.")}</strong><p>{t("专注训练这一领域，是提高整体分数最快的方法。", "專注練習這一領域，有助於提高整體分數。", "Focus your practice here to improve your overall score.")}</p></div></li>
        </ul>
        </>}
      </section>
      <section className={styles.reasoningPanel} aria-labelledby="reasoning-reading">
        <h2 id="reasoning-reading">{live ? t("如何理解本次推理结果", "如何理解本次推理結果", "What your reasoning result means") : t("你的131 IQ分数代表什么", "你的 131 IQ 分數代表什麼", "What your IQ score of 131 means")}</h2>
        {live ? <ul className={styles.reasoningReading}>
          <li><span aria-hidden="true">💼</span><div><strong>{t("工作中", "工作中", "At work")}</strong><p>{t("遇到新的图表或流程时，先列出已知关系，再逐项验证你的判断。", "遇到新的圖表或流程時，先列出已知關係，再逐項驗證你的判斷。", "When learning a new diagram or process, list the known relationships and check each assumption.")}</p></div></li>
          <li><span aria-hidden="true">📚</span><div><strong>{t("学习时", "學習時", "When studying")}</strong><p>{t("练习时先写下你用的规则，再用另一道题检验。", "練習時先寫下你用的規則，再用另一道題檢驗。", "Write down the rule you used, then test it against another example.")}</p></div></li>
        </ul> :
        <ul className={styles.reasoningReading}>
          <li><span aria-hidden="true">💼</span><div><strong>{t("工作中", "工作中", "At work")}</strong><p>{t("你这样的人学习新工具和系统非常快，也能发现他人遗漏的想法联系。", "你學習新工具和系統很快，也容易看出別人忽略的想法關聯。", "You pick up new tools and systems quickly and notice connections other people may miss.")}</p></div></li>
          <li><span aria-hidden="true">📚</span><div><strong>{t("学习时", "學習時", "When studying")}</strong><p>{t("新概念对你来说理解得更快，复杂的材料也不那么令人生畏。", "你能更快理解新概念，面對複雜材料時也較不容易卻步。", "You grasp new concepts quickly and find complex material less intimidating.")}</p></div></li>
        </ul>
        }
      </section>
    </div>
  </>;
}
