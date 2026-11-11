"use client";

import { useEffect, useState } from "react";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { BIG5_DOMAIN_LABELS, BIG5_FACETS } from "@/lib/big5/taxonomy";
import { BIG5_READING_SCENARIOS, type Big5ReadingContext, type Big5ReadingScore } from "@/lib/big5/reportReading";

const taiwanLabels: Readonly<Record<string, string>> = {
  "开放性": "開放性",
  "尽责性": "盡責性",
  "情绪性": "情緒性",
  "O1 想象力": "O1 想像力",
  "O2 审美兴趣": "O2 審美興趣",
  "O3 情感丰富度": "O3 情感豐富度",
  "O4 冒险性": "O4 冒險性",
  "O6 开放价值观": "O6 開放價值觀",
  "C2 条理性": "C2 條理性",
  "C3 责任感": "C3 責任感",
  "C6 审慎": "C6 審慎",
  "E3 自信主张": "E3 自信主張",
  "E4 活跃度": "E4 活躍度",
  "E6 愉悦感": "E6 愉悅感",
  "A2 诚实": "A2 誠實",
  "A5 谦逊": "A5 謙遜",
  "N1 焦虑": "N1 焦慮",
  "N2 愤怒": "N2 憤怒",
  "N3 抑郁": "N3 憂鬱",
  "N4 自我意识": "N4 自我意識",
  "N5 冲动": "N5 衝動",
  "学习与工作": "學習與工作",
  "选一个反复推迟的小任务；在两次相近机会中尝试先做五分钟，记录是否开始、干扰与代价。": "選一個反覆推遲的小任務；在兩次相近機會中嘗試先做五分鐘，記錄是否開始、干擾與代價。",
  "关系与沟通": "關係與溝通",
  "在一次低风险讨论前写下一句自己的需要，再问对方是否理解；记录回应和你是否仍能表达边界。": "在一次低風險討論前寫下一句自己的需要，再問對方是否理解；記錄回應和你是否仍能表達邊界。",
  "压力与恢复": "壓力與恢復",
  "在一次可控的忙碌后试五分钟安静休息，记录前后感受、负担和其他变化；不据一次改善认定因果。": "在一次可控的忙碌後試五分鐘安靜休息，記錄前後感受、負擔和其他變化；不據一次改善認定因果。"
};

export function Big5ReadingGuide({
  locale,
  displayLocale = locale,
  context,
}: {
  locale: Locale;
  displayLocale?: DisplayLocale;
  context: Big5ReadingContext;
}) {
  const taiwan = displayLocale === "zh-TW";
  const needsTraditional = taiwan && Boolean(context.quality.notice || context.norm.status || context.norm.sample || context.norm.explanation);
  const [traditionalText, setTraditionalText] = useState<((source: string) => string) | null>(null);
  useEffect(() => {
    if (!needsTraditional) return;
    let active = true;
    void loadTraditionalAssessmentText().then(
      translate => { if (active) setTraditionalText(() => (source: string) => translate(source).replaceAll("作答質量", "作答品質")); },
      () => { if (active) setTraditionalText(() => () => "繁體說明暫時無法載入。"); },
    );
    return () => { active = false; };
  }, [needsTraditional]);
  const referenceText = (source: string) => !taiwan || !source
    ? source
    : traditionalText?.(source) ?? "正在載入繁體說明…";
  const copy = (source: string, target: string) => taiwan ? target : source;
  const label = (source: string) => taiwan ? taiwanLabels[source] ?? source : source;
  const zh = locale === "zh";
  const [expanded, setExpanded] = useState<string[]>([]);
  const [scenario, setScenario] = useState("");
  const [experiment, setExperiment] = useState("");
  const [counterexample, setCounterexample] = useState("");
  const [actionSelected, setActionSelected] = useState(false);
  const unknown = zh ? "未提供" : "Not provided";
  const selected = BIG5_READING_SCENARIOS[scenario];
  const value = (score: Big5ReadingScore) => [
    score.band ? `${zh ? copy("本次分档", "本次分級") : "Reported band"} ${zh ? ({ extreme_low: copy("极低", "極低"), low: copy("较低", "較低"), low_mid: copy("中间偏低", "中間偏低"), mid: copy("中间", "中間"), high_mid: copy("中间偏高", "中間偏高"), high: copy("较高", "較高"), extreme_high: copy("极高", "極高") } as Record<string, string>)[score.band] ?? score.band : score.band.replaceAll("_", " ")}` : "",
    score.mean === null ? "" : `${zh ? "均分" : "Mean"} ${score.mean}`,
    score.percentile === null ? "" : `percentile ${score.percentile}`,
  ].filter(Boolean).join(" · ") || (zh ? copy("本次未提供可显示数值", "本次未提供可顯示數值") : "No displayable value provided");
  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5" data-testid="big5-reading-guide" aria-label={zh ? copy("五域与面向阅读", "五域與面向閱讀") : "Domain and facet reading"}>
    <h2 className="text-xl font-semibold">{zh ? copy("先看五域，再看六个面向", "先看五域，再看六個面向") : "Start with five domains, then explore six facets each"}</h2>
    {context.quality.notice ? <p role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-3">{referenceText(context.quality.notice)}</p> : null}
    <p>{zh ? copy("高低不是好坏。各面向属于本题本采用的 IPIP-NEO 解释体系；缺失不等于零分。", "高低不是好壞。各面向屬於本題本採用的 IPIP-NEO 解釋體系；缺失不等於零分。") : "High and low are not good and bad. These facets belong to this form’s IPIP-NEO interpretation framework; missing does not mean zero."}</p>
    <button type="button" className="min-h-11 rounded-lg border px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" aria-expanded={expanded.length === 5} onClick={() => setExpanded(expanded.length === 5 ? [] : context.domains.map((row) => row.code))}>{expanded.length === 5 ? (zh ? "收起全部面向" : "Collapse all facets") : (zh ? copy("展开全部面向", "展開全部面向") : "Expand all facets")}</button>
    <div className="space-y-3">{context.domains.map((domain) => {
      const code = domain.code as keyof typeof BIG5_DOMAIN_LABELS;
      const open = expanded.includes(code);
      return <section key={code} className="rounded-xl border p-4">
        <h3><button type="button" aria-expanded={open} aria-controls={`big5-reading-${code}`} className="flex min-h-11 w-full flex-wrap justify-between gap-2 text-left focus-visible:outline-2" onClick={() => setExpanded(open ? expanded.filter((item) => item !== code) : [...expanded, code])}>
          <strong>{label(BIG5_DOMAIN_LABELS[code][locale])}</strong><span>{value(domain)} · {open ? "−" : "+"}</span>
        </button></h3>
        <div id={`big5-reading-${code}`} hidden={!open}><dl className="mt-3 space-y-3">{BIG5_FACETS.filter((facet) => facet.domain === code).map((facet) => <div key={facet.facet_code} className="flex flex-wrap justify-between gap-2"><dt>{label(facet.display_label[locale])}</dt><dd>{value(context.facets.find((score) => score.code === facet.facet_code) ?? { code: facet.facet_code, band: null, mean: null, percentile: null })}</dd></div>)}</dl></div>
      </section>;
    })}</div>
    <details><summary className="min-h-11 cursor-pointer py-2">{zh ? copy("分数单位与本次参照", "分數單位與本次參照") : "Score units and this result’s reference"}</summary>
      <p>{zh ? copy("均分是原题本作答量尺的平均值。raw 为原始分；POMP 为可能得分范围内的位置，不是百分位；z 为参照均值的标准差距离；T 通常以50为中心、10为一个标准差；percentile 才是在所注明参照群体中的相对位置。这里只展示本次实际提供且允许的单位，不进行单位换算。", "均分是原題本作答量尺的平均值。raw 為原始分；POMP 為可能得分範圍內的位置，不是百分位；z 為參照均值的標準差距離；T 通常以50為中心、10為一個標準差；percentile 才是在所註明參照群體中的相對位置。這裡只展示本次實際提供且允許的單位，不進行單位換算。") : "Mean is the average on the form’s response scale. Raw is an original score; POMP is position within the possible score range, not a percentile. z expresses distance from a reference mean in standard deviations; T usually has mean 50 and standard deviation 10. Percentile describes position in the stated reference group. Only supplied and permitted units are displayed; none are converted here."}</p>
      <dl className="mt-3 space-y-2">{[
        [zh ? copy("参照状态", "參照狀態") : "Reference status", referenceText(context.norm.status)], [zh ? copy("群体", "群體") : "Sample", referenceText(context.norm.sample)],
        [zh ? copy("样本量", "樣本量") : "Sample size", context.norm.sampleN], [zh ? "版本" : "Version", context.norm.version],
        [zh ? copy("参照语言", "參照語言") : "Reference language", context.norm.locale], [zh ? copy("地区", "地區") : "Region", context.norm.region], [zh ? copy("年龄范围", "年齡範圍") : "Age range", context.norm.ageRange],
        [zh ? copy("作答质量", "作答品質") : "Response quality", context.quality.level],
      ].map(([label, val]) => <div key={label}><dt className="font-semibold">{label}</dt><dd>{val ?? unknown}{val === "" ? unknown : ""}</dd></div>)}</dl>
      <p>{referenceText(context.norm.explanation) || (zh ? copy("参照信息不足时不作人群排名；90与120题的参照不能混用，也不由界面语言推测国家。", "參照資訊不足時不作人群排名；90與120題的參照不能混用，也不由介面語言推測國家。") : "Insufficient reference evidence does not support population rankings. Do not mix 90- and 120-item references or infer country from interface language.")}</p>
    </details>
    <section className="space-y-3" aria-label={zh ? copy("我的习惯实验", "我的習慣實驗") : "My habit experiment"}>
      <h3 className="text-lg font-semibold">{zh ? copy("选一个情境，试一个可撤回的改变", "選一個情境，試一個可撤回的改變") : "Choose a context and one reversible change"}</h3>
      <label className="block">{zh ? "生活情境" : "Life context"}<select value={scenario} onChange={(event) => { setScenario(event.target.value); setActionSelected(false); }} className="mt-2 block min-h-11 w-full rounded-lg border p-2"><option value="">{zh ? copy("请选择", "請選擇") : "Choose a context"}</option>{Object.entries(BIG5_READING_SCENARIOS).map(([key, row]) => <option key={key} value={key}>{label(row[locale])}</option>)}</select></label>
      {selected ? <p>{zh ? copy("可先阅读：", "可先閱讀：") : "Start by exploring: "}{selected.domains.map((code) => label(BIG5_DOMAIN_LABELS[code][locale])).join(" · ")}. {zh ? label(selected.experimentZh) : selected.experimentEn}</p> : null}
      <label className="block">{zh ? copy("我选择的行动与观察日期（本人自述）", "我選擇的行動與觀察日期（本人自述）") : "My chosen action and observation date (my account)"}<textarea value={experiment} onChange={(event) => { setExperiment(event.target.value); setActionSelected(false); }} rows={3} className="mt-2 block w-full rounded-lg border p-3" /></label>
      <label className="block">{zh ? copy("与描述不一致的经历，或没有机会观察的地方", "與描述不一致的經歷，或沒有機會觀察的地方") : "An experience that does not fit, or where I had no opportunity to observe"}<textarea value={counterexample} onChange={(event) => setCounterexample(event.target.value)} rows={3} className="mt-2 block w-full rounded-lg border p-3" /></label>
      <p>{zh ? copy("记录同一行为、机会、情境与代价。分开自然反例和主动改变条件的尝试；没有机会不算反例。两种条件都实际观察后，再决定保留、缩小或搁置假设。短期变化不能验证人格或方法因果。", "記錄同一行為、機會、情境與代價。分開自然反例和主動改變條件的嘗試；沒有機會不算反例。兩種條件都實際觀察後，再決定保留、縮小或擱置假設。短期變化不能驗證人格或方法因果。") : "Record the same behavior, opportunities, context and costs. Separate natural counterexamples from trials that change conditions; no opportunity is not a counterexample. Observe both conditions before retaining, narrowing or setting aside a hypothesis. Short-term change does not validate a trait or establish causation."}</p>
      <button type="button" disabled={!experiment.trim()} onClick={() => setActionSelected(true)} className="min-h-11 rounded-lg border px-4 py-2 disabled:opacity-50">{zh ? copy("选择这项行动", "選擇這項行動") : "Choose this action"}</button>
      {actionSelected ? <p role="status">{zh ? copy("已在本页选择。请在离开前带走记录，刷新会清空；完成行动后再核对观察。", "已在本頁選擇。請在離開前帶走記錄，重新整理會清空；完成行動後再核對觀察。") : "Selected on this page. Take your notes before leaving; refreshing clears them. Review observations after trying the action."}</p> : null}
      <p className="text-sm text-slate-600">{zh ? copy("这些自述仅留在本页内存，不改写分数，也不会自动发送给 AI。", "這些自述僅留在本頁記憶體，不改寫分數，也不會自動傳送給 AI。") : "Your notes stay in this page’s memory, do not change scores and are not sent to AI automatically."}</p>
    </section>
  </section>;
}
