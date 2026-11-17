import type { DisplayLocale } from "@/lib/i18n/locales";

const COPY = {
  en: {
    accessHeading: "What you can see after the test",
    freeReport: "After submitting either version, you can view the four web report chapters for free in the browser you used to take the test. You can start and read the report as a guest.",
    basicReport: "You can start as a guest and view your basic result for free. Check your result page for the sections available for that attempt.",
    recovery: "Email is an optional way to recover your result later. PDF export is a separate download from your result page and depends on availability.",
    sampleLink: "See a scored sample report",
    sampleHeading: "Sample report from synthetic answers",
    source: "93 questions · Scoring version 2026.01.mbti_93 · English preview",
    summary: "FermatMind scored a synthetic set of answers using the live 93-question form. This abridged example shows the resulting type, preference scores, and the four chapter topics.",
    poles: ["Introversion", "Intuition", "Thinking", "Judging", "T (Turbulent)"],
    chapters: [
      ["Personality Traits", "Read the four preference pairs alongside the type. In this sample, the first two are close to the midpoint."],
      ["Your Career Path", "Consider which work tasks and environments suit your preferences. Compare the suggestions with work you have actually done."],
      ["Your Personal Growth", "Pick one habit to observe, then try a small change and record what happens."],
      ["Your Relationships", "Reflect on how you communicate, handle disagreements, and ask for what you need."],
    ],
    boundary: "The scores describe the direction of this set of answers. A/T adds a separate description. Use the report for self-reflection and exploration, outside clinical diagnosis.",
  },
  zh: {
    accessHeading: "提交后能看到什么",
    freeReport: "两种题本提交后，都可以在答题的浏览器里免费查看四章网页报告。开始答题和在当前浏览器查看报告均可使用访客身份。",
    basicReport: "可以用访客身份开始答题并免费查看基础结果。本次可阅读的章节以结果页显示为准。",
    recovery: "邮箱用于日后找回结果，可自行选择是否提供。PDF 是结果页的独立下载，取决于当次可用状态。",
    sampleLink: "看一份实际计分的报告示例",
    sampleHeading: "合成作答报告示例",
    source: "93 题 · 计分版本 2026.01.mbti_93 · 简体中文预览",
    summary: "费马测试用线上 93 题题本给一组人工构造的作答计分。以下节选展示实际得到的类型、偏好分数和报告四章的阅读重点。",
    poles: ["内向", "直觉", "思考", "判断", "T"],
    chapters: [
      ["人格特质", "把四组偏好与类型一起读。此例的前两组偏好都接近中点。"],
      ["职业路径", "思考哪类任务和工作环境更符合自己的偏好，再用实际做过的工作检验这些提示。"],
      ["个人成长", "选一个习惯观察，试着改变一个小步骤，并记录实际效果。"],
      ["关系模式", "回想自己平时如何沟通、处理分歧，以及表达需求。"],
    ],
    boundary: "分数表示这组作答的偏好方向。A/T 是独立的补充描述。报告用于自我探索和反思，临床诊断需由专业人员完成。",
  },
  "zh-TW": {
    accessHeading: "交卷後可以看什麼",
    freeReport: "兩種題本交卷後，都能在作答的瀏覽器免費閱讀四章網頁報告。開始作答和在同一個瀏覽器查看報告，都可以使用訪客身分。",
    basicReport: "可以用訪客身分開始作答並免費查看基本結果。這次能讀到的章節以結果頁顯示為準。",
    recovery: "電子郵件可用來日後找回結果，你可以自行選擇是否提供。PDF 是結果頁的獨立下載，能否下載以結果頁為準。",
    sampleLink: "看一份實際計分的報告範例",
    sampleHeading: "合成作答報告範例",
    source: "93 題 · 計分版本 2026.01.mbti_93 · 台灣繁體中文預覽",
    summary: "費馬測試以正式上線的 93 題題本，為一組人工設計的答案計分。這份節錄展示實際得到的類型、偏好分數，以及報告四章的閱讀重點。",
    poles: ["內向", "直覺", "思考", "判斷", "T"],
    chapters: [
      ["人格特質", "把四組偏好與類型一起看。這個範例的前兩組偏好都接近中點。"],
      ["職涯路徑", "想想哪些工作任務和環境符合自己的偏好，再以實際做過的工作檢視這些提示。"],
      ["個人成長", "挑一個習慣觀察，試著調整一個小步驟，再記下實際效果。"],
      ["關係模式", "回想自己平常怎麼溝通、處理歧見，以及表達需求。"],
    ],
    boundary: "分數呈現這組作答的偏好方向。A/T 是獨立的補充描述。報告用於自我探索與反思，臨床診斷需由專業人員完成。",
  },
} as const;

// Rounded scores toward the displayed pole, from a synthetic production mbti_93 report.
const SAMPLE_SCORES = [54, 54, 53, 57, 55] as const;

export function MbtiReportAccessSummary({
  locale,
  freeFullReport,
  cmsCopy,
}: {
  locale: DisplayLocale;
  freeFullReport: boolean;
  cmsCopy?: string;
}) {
  const copy = COPY[locale];
  const publishedCopy = freeFullReport && cmsCopy;
  return (
    <section data-mbti-report-copy={publishedCopy ? "cms" : "default"} aria-labelledby="mbti-report-access" className="space-y-2 rounded-2xl border border-slate-200 p-5 text-sm text-slate-700">
      <h2 id="mbti-report-access" className="m-0 text-lg font-semibold">{copy.accessHeading}</h2>
      <p className="m-0">{publishedCopy || (freeFullReport ? copy.freeReport : copy.basicReport)}</p>
      <p className="m-0">{copy.recovery}</p>
      <a className="inline-block font-semibold underline underline-offset-4" href="#scored-report-example">{copy.sampleLink}</a>
    </section>
  );
}

export function MbtiScoredReportExample({ locale }: { locale: DisplayLocale }) {
  const copy = COPY[locale];
  return (
    <section
      id="scored-report-example"
      aria-labelledby="mbti-scored-report-heading"
      className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 p-5 text-sm text-slate-700"
    >
      <h2 id="mbti-scored-report-heading" className="m-0 text-xl font-semibold">{copy.sampleHeading}</h2>
      <p className="m-0">{copy.source}</p>
      <p className="m-0">{copy.summary}</p>
      <p className="m-0 text-2xl font-semibold">INTJ-T</p>
      <dl className="m-0 grid gap-2 sm:grid-cols-2">
        {copy.poles.map((pole, index) => (
          <div key={pole} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <dt>{pole}</dt>
            <dd className="m-0 font-semibold tabular-nums">{SAMPLE_SCORES[index]}%</dd>
          </div>
        ))}
      </dl>
      <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {copy.chapters.map(([heading, text], index) => (
          <li key={heading}>
            <h3 className="m-0 font-semibold">{index + 1}. {heading}</h3>
            <p className="m-0">{text}</p>
          </li>
        ))}
      </ol>
      <p className="m-0">{copy.boundary}</p>
    </section>
  );
}
