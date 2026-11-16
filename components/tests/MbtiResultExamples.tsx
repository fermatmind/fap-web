"use client";

import Link from "next/link";
import { useRef } from "react";
import { useFragmentNavigation } from "@/hooks/useFragmentNavigation";

const EXAMPLES = [
  {
    key: "clearer",
    title: "A clearer preference pattern",
    pairs: ["I 70% / E 30%", "N 65% / S 35%", "T 75% / F 25%", "P 60% / J 40%"],
    reading: "The higher poles spell INTP in this illustration. Start with the four pairs, then check where the descriptions fit your experience and where they do not. A larger gap does not establish stronger ability or a more certain identity.",
    action: "For a meeting, try writing a short outline before speaking. Record whether it helped you explain your point, and one occasion when talking it through first worked better.",
  },
  {
    key: "close",
    title: "A preference near the midpoint",
    pairs: ["I 51% / E 49%", "N 65% / S 35%", "T 75% / F 25%", "P 60% / J 40%"],
    reading: "I is only slightly higher than E here. A small response difference could change the first letter while the other pairs stay the same. Read both descriptions and keep the context, rather than treating the two-point gap as a firm division between people.",
    action: "Compare two ordinary discussions: one where you prepared alone and one where you developed an idea aloud. Note the task, what you did, what helped, and a counterexample. You can use this observation without taking another test.",
  },
] as const;

const ZH_EXAMPLES = {
  clearer: {
    title: "偏好差距较明显",
    reading: "示例中分数较高的一侧组成 INTP。先看四组偏好，再用实际经历核对描述适用于哪些情况。差距较大也不能说明能力更强，或类型判断更确定。",
    action: "下次开会前，先写一份发言提纲。会后记录提纲有没有帮你讲清楚，再想一次先和别人聊反而更容易理清思路的经历。",
  },
  close: {
    title: "一组偏好接近中点",
    reading: "I 只比 E 高两个百分点。少量作答变化就可能让第一个字母翻转，其余三组仍相同。可以同时读 I 和 E 的解释，结合当时的情境理解这点差距。",
    action: "对照两次讨论。一次先独自准备，另一次边说边整理思路。记下当时的任务、你的做法、实际帮助以及一个反例。两次经历都能为你提供线索。",
  },
} as const;

const TW_EXAMPLES = {
  clearer: {
    title: "偏好差距較明顯",
    reading: "示例中分數較高的一側組成 INTP。先看四組偏好，再用實際經歷核對描述適用於哪些情況。差距較大也不能說明能力更強，或類型判斷更確定。",
    action: "下次開會前，先寫一份發言提綱。會後記錄提綱有沒有幫你講清楚，再想一次先和別人聊反而更容易理清思路的經歷。",
  },
  close: {
    title: "一組偏好接近中點",
    reading: "I 只比 E 高兩個百分點。少量作答變化就可能讓第一個字母翻轉，其餘三組仍相同。可以同時讀 I 和 E 的解釋，結合當時的情境理解這點差距。",
    action: "對照兩次討論。一次先獨自準備，另一次邊說邊整理思路。記下當時的任務、你的做法、實際幫助以及一個反例。兩次經歷都能為你提供線索。",
  },
} as const;

const PAIR_LABELS = {
  "zh-TW": ["內向 / 外向", "直覺 / 實感", "思考 / 情感", "知覺 / 判斷"],
  zh: ["内向 / 外向", "直觉 / 实感", "思考 / 情感", "知觉 / 判断"],
  en: ["Introversion / Extraversion", "Intuition / Sensing", "Thinking / Feeling", "Perceiving / Judging"],
} as const;

export function MbtiResultExamples({ locale = "en", guideHref }: { locale?: "zh" | "en" | "zh-TW"; guideHref?: string }) {
  const zh = locale !== "en";
  const traditional = locale === "zh-TW";
  const chineseExamples = traditional ? TW_EXAMPLES : ZH_EXAMPLES;
  const section = useRef<HTMLElement>(null);
  useFragmentNavigation(section);
  return (
    <section ref={section} id="result-examples" aria-labelledby="mbti-examples-title" data-testid="mbti-result-examples" className="space-y-6">
      <h2 id="mbti-examples-title">{traditional ? "答題前，先看兩個結果示例" : zh ? "答题前，先看两个结果示例" : "See a result before you start"}</h2>
      <p className="m-0 text-sm text-slate-600">
        {traditional ? "以下為虛構教學示例，用於說明偏好百分比的讀法。93 題和 144 題都使用四組核心偏好。這裡的數字不來自作答記錄，也不用於比較兩版分數。" : zh
          ? "以下为虚构教学示例，用于说明偏好百分比的读法。93 题和 144 题都使用四组核心偏好。这里的数字不来自作答记录，也不用于比较两版分数。"
          : "These two synthetic examples illustrate how to read preference percentages. They are not scored attempts, real user reports, or your result. Both the 93- and 144-question forms use four core preference pairs; the figures below do not demonstrate a difference between the forms or establish that their scores are interchangeable."}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {EXAMPLES.map((example) => (
          <article key={example.key} data-example={example.key} className="min-w-0 space-y-4 rounded-2xl border border-slate-200 p-5">
            <h3 className="m-0 text-xl font-semibold">{zh ? chineseExamples[example.key].title : example.title}</h3>
            <dl className="m-0 space-y-2 text-sm">
              {example.pairs.map((pair, index) => (
                <div key={pair} className="flex flex-wrap justify-between gap-2">
                  <dt>{PAIR_LABELS[locale][index]}</dt>
                  <dd className="m-0 font-semibold tabular-nums">{pair}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 text-sm text-slate-600">{zh ? chineseExamples[example.key].reading : example.reading}</p>
            <p className="m-0 text-sm text-slate-600"><strong>{traditional ? "可以試一次：" : zh ? "可以试一次：" : "One next step: "}</strong>{zh ? chineseExamples[example.key].action : example.action}</p>
          </article>
        ))}
      </div>
      <p className="m-0 text-sm text-slate-600">
        {traditional ? "百分比表示這次作答在各組偏好上的方向。它不能用來判斷你在人群中的位置、測量準確性、統計置信程度或職業適配。A/T 是單獨的附加描述。這個示例沒有真實題本版本、作答質量評價或人群參照。" : zh
          ? "百分比表示这次作答在各组偏好上的方向。它不能用来判断你在人群中的位置、测量准确性、统计置信程度或职业适配。A/T 是单独的附加描述。这个示例没有真实题本版本、作答质量评价或人群参照。"
          : "The percentages describe response direction within a result, not population percentiles, accuracy, statistical confidence, or career suitability. A/T is a separate additional description and is not inferred from these four pairs. No scoring version, response-quality assessment, or population reference is supplied for these teaching examples. For your own result, retain its questionnaire form, versions, units, and quality guidance; missing information stays unknown."}
      </p>
      {zh ? (
        <p className="m-0 text-sm text-slate-600">
          {traditional ? "查看自己的結果時，可以把題本、四組偏好及一次觀察記在自己的文件裡。如果結果仍在載入或暫時無法查看，請使用頁面上的重試或找回入口。接著" : "查看自己的结果时，可以把题本、四组偏好及一次观察记在自己的文档里。如果结果仍在加载或暂时无法查看，请使用页面上的重试或找回入口。继续"}{" "}
          <Link href={guideHref ?? "/zh/articles/mbti-full-report-career-relationship-communication"} className="underline underline-offset-4">{traditional ? "閱讀結果解讀指南" : "阅读结果解读指南"}</Link>{" "}
          或{" "}
          <a href="#choose-version" className="underline underline-offset-4">{traditional ? "選擇 93 題或 144 題" : "选择 93 题或 144 题"}</a>。
        </p>
      ) : (
        <>
          <p className="m-0 text-sm text-slate-600">
            After completing your chosen form, read the result overview and preference details, then choose one observation. If the result is still loading or unavailable, use its retry or recovery option; these examples cannot replace it. You can also read the{" "}
            <Link href="/en/articles/mbti-full-report-career-relationship-communication" className="underline underline-offset-4">guide to understanding and using your results</Link>{" "}
            or <a href="#choose-version" className="underline underline-offset-4">choose the 93- or 144-question version</a>.
          </p>
          <p className="m-0 text-sm text-slate-600">
            Keep your own notes with the observation record: it includes a blank record and a clearly synthetic planning example, without calculating a score. Download the{" "}
            <a href="/resources/mbti/fermatmind-personality-observation-en.txt" download className="underline underline-offset-4">observation record (TXT)</a>{" "}
            or <a href="/resources/mbti/fermatmind-personality-observation-en.md" download className="underline underline-offset-4">observation record (Markdown)</a>.
            Open the saved file and check its contents. Your notes stay in your own file; there is no automatic upload or cloud save. If downloading is unavailable, copy the observation steps above into your own document.
          </p>
        </>
      )}
    </section>
  );
}
