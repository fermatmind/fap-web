"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { BIG5_DOMAIN_LABELS, BIG5_FACETS } from "@/lib/big5/taxonomy";
import { BIG5_READING_SCENARIOS, type Big5ReadingContext, type Big5ReadingScore } from "@/lib/big5/reportReading";

export function Big5ReadingGuide({ locale, context }: { locale: Locale; context: Big5ReadingContext }) {
  const zh = locale === "zh";
  const [expanded, setExpanded] = useState<string[]>([]);
  const [scenario, setScenario] = useState("");
  const [experiment, setExperiment] = useState("");
  const [counterexample, setCounterexample] = useState("");
  const [actionSelected, setActionSelected] = useState(false);
  const unknown = zh ? "未提供" : "Not provided";
  const selected = BIG5_READING_SCENARIOS[scenario];
  const value = (score: Big5ReadingScore) => [
    score.band ? `${zh ? "本次分档" : "Reported band"} ${zh ? ({ extreme_low: "极低", low: "较低", low_mid: "中间偏低", mid: "中间", high_mid: "中间偏高", high: "较高", extreme_high: "极高" } as Record<string, string>)[score.band] ?? score.band : score.band.replaceAll("_", " ")}` : "",
    score.mean === null ? "" : `${zh ? "均分" : "Mean"} ${score.mean}`,
    score.percentile === null ? "" : `percentile ${score.percentile}`,
  ].filter(Boolean).join(" · ") || (zh ? "本次未提供可显示数值" : "No displayable value provided");
  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5" data-testid="big5-reading-guide" aria-label={zh ? "五域与面向阅读" : "Domain and facet reading"}>
    <h2 className="text-xl font-semibold">{zh ? "先看五域，再看六个面向" : "Start with five domains, then explore six facets each"}</h2>
    {context.quality.notice ? <p role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-3">{context.quality.notice}</p> : null}
    <p>{zh ? "高低不是好坏。各面向属于本题本采用的 IPIP-NEO 解释体系；缺失不等于零分。" : "High and low are not good and bad. These facets belong to this form’s IPIP-NEO interpretation framework; missing does not mean zero."}</p>
    <button type="button" className="min-h-11 rounded-lg border px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" aria-expanded={expanded.length === 5} onClick={() => setExpanded(expanded.length === 5 ? [] : context.domains.map((row) => row.code))}>{expanded.length === 5 ? (zh ? "收起全部面向" : "Collapse all facets") : (zh ? "展开全部面向" : "Expand all facets")}</button>
    <div className="space-y-3">{context.domains.map((domain) => {
      const code = domain.code as keyof typeof BIG5_DOMAIN_LABELS;
      const open = expanded.includes(code);
      return <section key={code} className="rounded-xl border p-4">
        <h3><button type="button" aria-expanded={open} aria-controls={`big5-reading-${code}`} className="flex min-h-11 w-full flex-wrap justify-between gap-2 text-left focus-visible:outline-2" onClick={() => setExpanded(open ? expanded.filter((item) => item !== code) : [...expanded, code])}>
          <strong>{BIG5_DOMAIN_LABELS[code][locale]}</strong><span>{value(domain)} · {open ? "−" : "+"}</span>
        </button></h3>
        <div id={`big5-reading-${code}`} hidden={!open}><dl className="mt-3 space-y-3">{BIG5_FACETS.filter((facet) => facet.domain === code).map((facet) => <div key={facet.facet_code} className="flex flex-wrap justify-between gap-2"><dt>{facet.display_label[locale]}</dt><dd>{value(context.facets.find((score) => score.code === facet.facet_code) ?? { code: facet.facet_code, band: null, mean: null, percentile: null })}</dd></div>)}</dl></div>
      </section>;
    })}</div>
    <details><summary className="min-h-11 cursor-pointer py-2">{zh ? "分数单位与本次参照" : "Score units and this result’s reference"}</summary>
      <p>{zh ? "均分是原题本作答量尺的平均值。raw 为原始分；POMP 为可能得分范围内的位置，不是百分位；z 为参照均值的标准差距离；T 通常以50为中心、10为一个标准差；percentile 才是在所注明参照群体中的相对位置。这里只展示本次实际提供且允许的单位，不进行单位换算。" : "Mean is the average on the form’s response scale. Raw is an original score; POMP is position within the possible score range, not a percentile. z expresses distance from a reference mean in standard deviations; T usually has mean 50 and standard deviation 10. Percentile describes position in the stated reference group. Only supplied and permitted units are displayed; none are converted here."}</p>
      <dl className="mt-3 space-y-2">{[
        [zh ? "参照状态" : "Reference status", context.norm.status], [zh ? "群体" : "Sample", context.norm.sample],
        [zh ? "样本量" : "Sample size", context.norm.sampleN], [zh ? "版本" : "Version", context.norm.version],
        [zh ? "参照语言" : "Reference language", context.norm.locale], [zh ? "地区" : "Region", context.norm.region], [zh ? "年龄范围" : "Age range", context.norm.ageRange],
        [zh ? "作答质量" : "Response quality", context.quality.level],
      ].map(([label, val]) => <div key={label}><dt className="font-semibold">{label}</dt><dd>{val ?? unknown}{val === "" ? unknown : ""}</dd></div>)}</dl>
      <p>{context.norm.explanation || (zh ? "参照信息不足时不作人群排名；90与120题的参照不能混用，也不由界面语言推测国家。" : "Insufficient reference evidence does not support population rankings. Do not mix 90- and 120-item references or infer country from interface language.")}</p>
    </details>
    <section className="space-y-3" aria-label={zh ? "我的习惯实验" : "My habit experiment"}>
      <h3 className="text-lg font-semibold">{zh ? "选一个情境，试一个可撤回的改变" : "Choose a context and one reversible change"}</h3>
      <label className="block">{zh ? "生活情境" : "Life context"}<select value={scenario} onChange={(event) => { setScenario(event.target.value); setActionSelected(false); }} className="mt-2 block min-h-11 w-full rounded-lg border p-2"><option value="">{zh ? "请选择" : "Choose a context"}</option>{Object.entries(BIG5_READING_SCENARIOS).map(([key, row]) => <option key={key} value={key}>{row[locale]}</option>)}</select></label>
      {selected ? <p>{zh ? "可先阅读：" : "Start by exploring: "}{selected.domains.map((code) => BIG5_DOMAIN_LABELS[code][locale]).join(" · ")}. {zh ? selected.experimentZh : selected.experimentEn}</p> : null}
      <label className="block">{zh ? "我选择的行动与观察日期（本人自述）" : "My chosen action and observation date (my account)"}<textarea value={experiment} onChange={(event) => { setExperiment(event.target.value); setActionSelected(false); }} rows={3} className="mt-2 block w-full rounded-lg border p-3" /></label>
      <label className="block">{zh ? "与描述不一致的经历，或没有机会观察的地方" : "An experience that does not fit, or where I had no opportunity to observe"}<textarea value={counterexample} onChange={(event) => setCounterexample(event.target.value)} rows={3} className="mt-2 block w-full rounded-lg border p-3" /></label>
      <p>{zh ? "记录同一行为、机会、情境与代价。分开自然反例和主动改变条件的尝试；没有机会不算反例。两种条件都实际观察后，再决定保留、缩小或搁置假设。短期变化不能验证人格或方法因果。" : "Record the same behavior, opportunities, context and costs. Separate natural counterexamples from trials that change conditions; no opportunity is not a counterexample. Observe both conditions before retaining, narrowing or setting aside a hypothesis. Short-term change does not validate a trait or establish causation."}</p>
      <button type="button" disabled={!experiment.trim()} onClick={() => setActionSelected(true)} className="min-h-11 rounded-lg border px-4 py-2 disabled:opacity-50">{zh ? "选择这项行动" : "Choose this action"}</button>
      {actionSelected ? <p role="status">{zh ? "已在本页选择。请在离开前带走记录，刷新会清空；完成行动后再核对观察。" : "Selected on this page. Take your notes before leaving; refreshing clears them. Review observations after trying the action."}</p> : null}
      <p className="text-sm text-slate-600">{zh ? "这些自述仅留在本页内存，不改写分数，也不会自动发送给 AI。" : "Your notes stay in this page’s memory, do not change scores and are not sent to AI automatically."}</p>
    </section>
  </section>;
}
