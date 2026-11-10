import type { DisplayLocale } from "@/lib/i18n/locales";

// Synthetic teaching examples in the existing dimension_scores_0_100 space.
// These are not scored attempts, norms, or thresholds for either form.
export const RIASEC_RESULT_EXAMPLES = [
  { key: "ordered", scores: [42, 80, 72, 65, 39, 36], codes: ["IAS"] },
  { key: "close", scores: [42, 80, 72, 70, 39, 36], codes: ["IAS", "ISA"] },
  { key: "tied", scores: [42, 80, 72, 72, 39, 36], codes: ["IAS", "ISA"] },
] as const;

const DIMENSIONS = [
  ["R", "现实型", "Realistic", "實際型"],
  ["I", "研究型", "Investigative", "研究型"],
  ["A", "艺术型", "Artistic", "藝術型"],
  ["S", "社会型", "Social", "社會型"],
  ["E", "企业型", "Enterprising", "企業型"],
  ["C", "常规型", "Conventional", "常規型"],
] as const;

export function RiasecResultExamples({ locale }: { locale: DisplayLocale }) {
  const traditional = locale === "zh-TW";
  const zh = locale === "zh";
  const text = (zhText: string, enText: string, twText: string) => traditional ? twText : zh ? zhText : enText;
  const titles = traditional ? ["先讀 Top 3", "分數接近", "分數並列"] : zh ? ["先读 Top 3", "分数接近", "分数并列"] : ["Read the Top 3", "Close scores", "Tied scores"];
  const readings = traditional ? [
    "I 80、A 72、S 65 是本例前三維。IAS 是閱讀興趣組合的起點：先觀察研究、表達與助人活動，再看完整六維，不用一個字母概括自己。",
    "A 72 與 S 70 接近，IAS 和 ISA 可一起參考。不要把這 2 分讀成確定的先後差異；分別嘗試表達與助人任務，記錄更願意繼續做哪一種。",
    "A 與 S 同為 72，第二、三位並列。IAS / ISA 是同一興趣組合的兩種閱讀順序，不必強行選一個；保留兩類活動繼續探索。",
  ] : zh ? [
    "I 80、A 72、S 65 是本例前三维。IAS 是阅读兴趣组合的起点：先观察研究、表达与助人活动，再看完整六维，不用一个字母概括自己。",
    "A 72 与 S 70 接近，IAS 和 ISA 可一起参考。不要把这 2 分读成确定的先后差异；分别尝试表达与助人任务，记录更愿意继续做哪一种。",
    "A 与 S 同为 72，第二、三位并列。IAS / ISA 是同一兴趣组合的两种阅读顺序，不必强行选一个；保留两类活动继续探索。",
  ] : [
    "I 80, A 72, and S 65 are the three highest dimensions here. IAS is a starting point: explore investigative, expressive, and helping activities, then read all six dimensions rather than defining yourself by one letter.",
    "A 72 and S 70 are close in this example. Read IAS alongside ISA. Do not treat the two-point gap as a definitive ordering; try an expressive task and a helping task, and record which you want to continue.",
    "A and S both score 72, tying for second and third. IAS / ISA are two reading orders for the same interest combination. Keep both kinds of activities open for exploration.",
  ];

  return <section id="result-examples" aria-labelledby="result-examples-title" className="mx-auto max-w-4xl scroll-mt-24 space-y-4" data-testid="riasec-result-examples">
    <h2 id="result-examples-title" className="m-0 text-2xl font-semibold">{text("合成结果示例：怎样读六维与 Top 3", "Synthetic result examples: six dimensions and Top 3", "合成結果範例：怎樣讀六維與 Top 3")}</h2>
    <p className="m-0 text-sm leading-7 text-slate-600">{text("以下数字是为教学构造的合成示例，不是真实用户报告，也不是你的结果。0–100 表示本题本的维度兴趣分数，不是百分位、能力分或职业成功率；60 题与 140 题不可直接比较分差。", "These synthetic numbers were created for teaching. They are not real user reports or your results. The 0–100 values are dimension interest scores within a form, not percentiles, ability scores, or career success rates. Do not compare numeric score differences across the 60- and 140-question forms.", "以下數字是為教學構造的合成範例，不是真實使用者報告，也不是你的結果。0–100 表示本題本的維度興趣分數，不是百分位、能力分或職業成功率；60 題與 140 題不可直接比較分差。")}</p>
    <div className="grid gap-4 md:grid-cols-3">
      {RIASEC_RESULT_EXAMPLES.map((example, index) => <article key={example.key} className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-5" data-example={example.key}>
        <h3 className="m-0 text-lg font-semibold">{titles[index]}</h3>
        <p className="m-0 font-semibold text-slate-900">{text("Top 3 阅读顺序", "Top 3 reading order", "Top 3 閱讀順序")}: {example.codes.join(" / ")}</p>
        <dl className="m-0 space-y-3" aria-label={text("六维兴趣分数（0–100）", "Six dimension interest scores (0–100)", "六維興趣分數（0–100）")}>
          {DIMENSIONS.map(([code, cn, en, tw], dimensionIndex) => <div key={code}>
            <div className="flex justify-between gap-2 text-sm"><dt>{code} · {text(cn, en, tw)}</dt><dd className="m-0 font-semibold tabular-nums">{example.scores[dimensionIndex]}</dd></div>
            <div aria-hidden="true" className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-700" style={{ width: `${example.scores[dimensionIndex]}%` }} /></div>
          </div>)}
        </dl>
        <p className="m-0 text-sm leading-7 text-slate-600">{readings[index]}</p>
      </article>)}
    </div>
    <p className="m-0 text-sm leading-7 text-slate-600">{text("实际阅读时，以自己报告中的作答质量、接近或并列提示为准，不要把示例分差当作所有题本的判定阈值。若整体分数接近或结果不清晰，先保留多个方向，用小任务收集更多线索。", "For your own result, follow its response-quality, close-score, and tie guidance. The example gaps are not thresholds for every form. If scores are broadly similar or the result is unclear, keep several directions open and gather evidence through small tasks.", "實際閱讀時，以自己報告中的作答質量、接近或並列提示為準，不要把示例分差當作所有題本的判定閾值。若整體分數接近或結果不清晰，先保留多個方向，用小任務收集更多線索。")}</p>
  </section>;
}
