import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/site";
import { historyAtlasCopy, type AtlasQuery, type HistoryAtlas } from "@/lib/entertainment/global-history/atlas";
import { globalHistoryAtlasPath, globalHistoryPath, globalHistoryResultPath, historyAtlasDownloads } from "@/lib/entertainment/global-history/config";
import { historyPeople } from "@/lib/entertainment/global-history/people";
import { coxStudy, coxTranscriptionCredit, getHistoryResult, resultCopy } from "@/lib/entertainment/global-history/result-v2";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import { GlobalHistoryCitation } from "./GlobalHistoryAtlasCitation";
import { historyReferenceCitation } from "@/lib/entertainment/global-history/reference";
import styles from "./GlobalHistoryAtlas.module.css";

const coxDatasetDescriptions = {
  zh: "费马整理的 Cox（1926）派生数据集收录原书表 12A 和 12B 中有估值的 301 位历史人物，提供童年和青年阶段的原估值、概然误差、史料等级、信度及修正估值。数据用于查阅历史研究，不能换算为现代智商测验分数或人口百分位。",
  "zh-TW": "費馬整理的 Cox（1926）衍生資料集收錄原書表 12A 和 12B 中有估值的 301 位歷史人物，提供童年和青年階段的原估值、概然誤差、史料等級、信度及修正估值。資料供查閱歷史研究，無法換算為現代智商測驗分數或人口百分位。",
  en: historyAtlasCopy["cox-1926"].description.en,
} satisfies Record<DisplayLocale, string>;

function value(query: AtlasQuery, key: string) {
  const entry = query[key];
  return typeof entry === "string" ? entry : "";
}

export function GlobalHistoryAtlas({ locale, atlas, query }: { locale: DisplayLocale; atlas: HistoryAtlas; query: AtlasQuery }) {
  const t = (zh: string, tw: string, en: string) => resultCopy(zh, tw, en)[locale];
  const lang = locale === "en" ? "en" : "zh";
  const copy = historyAtlasCopy[atlas];
  const showCox = atlas === "cox-1926";
  const path = globalHistoryAtlasPath(locale, atlas);
  const roster = historyPeople.flatMap(person => {
    const result = getHistoryResult(person);
    if (!result || (showCox && !result.iq_benchmark.has_cox_data)) return [];
    const localized = displayHistoryPerson(person, locale);
    return [{
      id: person.id, name: localized.name[lang], type: result.personality_benchmark.inferred_mbti,
      era: result.era[locale], region: localized.region[lang], field: localized.field[lang],
      cox: result.iq_benchmark.has_cox_data ? result.iq_benchmark.estimate : null,
    }];
  });
  const filters = [
    ...showCox ? [] : [{ key: "type" as const, label: t("传记人格", "傳記人格", "Biographical type") }],
    { key: "era" as const, label: t("时代", "時代", "Era") },
    { key: "region" as const, label: t("地区", "地區", "Region") },
    { key: "field" as const, label: t("领域", "領域", "Field") },
  ].map(filter => {
    const options = [...new Set(roster.map(row => row[filter.key]))].sort((a, b) => a.localeCompare(b, locale));
    const selected = value(query, filter.key);
    return { ...filter, options, selected: options.includes(selected) ? selected : "" };
  });
  const order = value(query, "sort");
  const rows = roster.filter(row => filters.every(filter => !filter.selected || row[filter.key] === filter.selected));
  rows.sort((a, b) =>
    showCox && order === "youth" ? (b.cox?.youth_corrected ?? 0) - (a.cox?.youth_corrected ?? 0) || a.name.localeCompare(b.name, locale)
      : showCox && order === "childhood" ? (b.cox?.childhood_corrected ?? 0) - (a.cox?.childhood_corrected ?? 0) || a.name.localeCompare(b.name, locale)
        : showCox || order === "name" ? a.name.localeCompare(b.name, locale)
          : a.type.localeCompare(b.type, "en") || a.name.localeCompare(b.name, locale)
  );
  const types = [...new Set(roster.map(row => row.type))].sort();
  const canonical = SITE_URL + path;
  const title = copy.title[locale];
  const downloads = [
    { label: "CSV", path: historyAtlasDownloads[atlas] + ".csv", encodingFormat: "text/csv" },
    { label: "JSON", path: historyAtlasDownloads[atlas] + ".json", encodingFormat: "application/json" },
  ];
  const citations = historyReferenceCitation(title, canonical, "Data set");
  const countByType = new Map(types.map(type => [type, roster.filter(row => row.type === type).length]));
  const n = roster.filter(row => row.type[1] === "N").length;
  const nShare = (n / roster.length * 100).toFixed(1);
  const esfj = countByType.get("ESFJ");
  const esfp = countByType.get("ESFP");
  const groupA = roster.filter(row => row.cox?.group === "A").length;
  const groupB = roster.length - groupA;
  const periodColumns = [
    t("未修正估值", "未修正估值", "Original estimate"),
    t("概然误差", "概然誤差", "Probable error"),
    t("史料等级", "史料等級", "Evidence grade"),
    t("信度 r", "信度 r", "Reliability r"),
    t("修正估值", "修正估值", "Corrected estimate"),
  ];
  const itemList = {
    "@type": "ItemList", "@id": canonical + "#figures", name: copy.title[locale], numberOfItems: roster.length,
    itemListElement: rows.map((row, index) => ({
      "@type": "ListItem", position: index + 1, name: row.name, url: SITE_URL + globalHistoryResultPath(locale, row.id),
    })),
  };

  return <Container as="main" className={styles.atlas}>
    {!Object.values(query).some(Boolean) && <JsonLd id="history-atlas-data" data={{
      "@context": "https://schema.org",
      "@graph": showCox ? [itemList, {
        "@type": "Dataset", "@id": canonical + "#dataset", name: copy.title[locale], description: coxDatasetDescriptions[locale],
        url: canonical, inLanguage: locale === "zh" ? "zh-CN" : locale,
        creator: { "@type": "Organization", name: "FermatMind", url: SITE_URL },
        isBasedOn: [coxStudy, coxTranscriptionCredit.url],
        distribution: downloads.map(item => ({ "@type": "DataDownload", contentUrl: SITE_URL + item.path, encodingFormat: item.encodingFormat })),
        license: coxTranscriptionCredit.license,
      }] : [itemList],
    }} />}
    <nav className={styles.links} aria-label={t("全球卷导航", "全球篇導覽", "World Edition navigation")}>
      <Link href={globalHistoryPath(locale)}>{t("12 题历史人物测试", "12 題歷史人物測驗", "12-question historical figure quiz")}</Link>
      <Link href={globalHistoryAtlasPath(locale, showCox ? "personality-atlas" : "cox-1926")}>
        {historyAtlasCopy[showCox ? "personality-atlas" : "cox-1926"].title[locale]}
      </Link>
      {(["zh", "zh-TW", "en"] as const).filter(other => other !== locale).map(other => <Link key={other}
        href={globalHistoryAtlasPath(other, atlas)} hrefLang={other === "zh" ? "zh-CN" : other}>{other === "en" ? "English" : other === "zh" ? "简体中文" : "繁體中文"}</Link>)}
    </nav>
    <h1>{copy.title[locale]}</h1>
    <p>{copy.description[locale]}</p>
    <section className={styles.referenceCard} aria-labelledby="atlas-method">
      <h2 id="atlas-method">{t("样本与方法", "樣本與方法", "Sample and method")}</h2>
      <p>{copy.method[locale]}</p>
      {showCox ? <>
        <p>{t(
          `表 12A 的 A 组有 ${groupA} 位估值人物，表 12B 的 B 组有 ${groupB} 位。另有 11 人列名但未评分。排名是各组内的显著度序位。样本以欧美名人为主。`,
          `表 12A 的 A 組有 ${groupA} 位估值人物，表 12B 的 B 組有 ${groupB} 位。另有 11 人列名但未評分。排名是各組內的知名度序位。樣本以歐美知名人物為主。`,
          `Table 12A has ${groupA} rated figures in Group A, and Table 12B has ${groupB} in Group B. Eleven additional people were listed without estimates. Eminence rank is within each group. The selection was largely European and American.`,
        )}</p>
        <p>{t(
          "Cox 在第 82 页用原估值加上（参照组均值 − 100）×（1 − 史料信度）。参照组均值高于 100 时，信度越低，增加值越大。达·芬奇的青年估值从 150 调到 180；这 30 分来自公式，无法补回缺失的史料。",
          "Cox 在第 82 頁用原估值加上（參照組平均值 − 100）×（1 − 史料信度）。參照組平均值高於 100 時，信度越低，增量越大。達文西的青年估值從 150 調到 180；這 30 分來自公式，無法補回缺失的史料。",
          "On p. 82, Cox adds (reference-group mean − 100) × (1 − evidence reliability) to the original estimate. When the group mean exceeds 100, lower reliability produces a larger increment. Leonardo’s youth estimate moves from 150 to 180. The extra 30 points come from the formula and cannot recover missing records.",
        )}</p>
        <p className={styles.links}>
          <a href={coxStudy}>{t("Cox 原书折页 12A／12B", "Cox 原書摺頁 12A／12B", "Cox’s original fold-outs 12A and 12B")}</a>
          <span>{t("转录来源", "轉錄來源", "Transcription credit")} · <a href={coxTranscriptionCredit.url}>{coxTranscriptionCredit.creator}</a> · <a href={coxTranscriptionCredit.license}>CC BY 4.0</a></span>
        </p>
      </> : <p>{t(
        `全库 ${roster.length} 人中，直觉型 N 有 ${n} 人（${nShare}%），ESFJ 有 ${esfj} 人、ESFP 有 ${esfp} 人。这些比例反映费马所选人物及编辑归类，无法推断历史或现代人口的类型分布。`,
        `全庫 ${roster.length} 人中，直覺型 N 有 ${n} 人（${nShare}%），ESFJ 有 ${esfj} 人、ESFP 有 ${esfp} 人。這些比例反映費馬選取的人物與編輯歸類，無法推論歷史或現代人口的類型分布。`,
        `Of ${roster.length} figures, ${n} (${nShare}%) are read as N. ESFJ and ESFP have ${esfj} and ${esfp} respectively. The counts reflect FermatMind’s selection and editorial readings. They cannot estimate historical or present-day population distributions.`,
      )}</p>}
      <p className={styles.links}>{downloads.map(item => <a key={item.label} href={item.path} download={item.path.split("/").at(-1)}>{t("下载", "下載", "Download")} {item.label}</a>)}</p>
    </section>
    <GlobalHistoryCitation citations={citations} labels={{
      heading: t("引用本图鉴", "引用本圖鑑", "Cite this atlas"),
      copy: t("复制", "複製", "Copy"),
      copied: t("已复制", "已複製", "Copied"),
      manual: t("请复制已选中的引用文字。", "請複製已選取的引用文字。", "Copy the selected citation text."),
    }} />
    {!showCox && <section aria-labelledby="atlas-types">
      <h2 id="atlas-types">{t("按传记类型浏览", "依傳記類型瀏覽", "Browse by biographical type")}</h2>
      <ul className={styles.links}>{types.map(type => <li key={type}>
        <Link href={`${path}?type=${type}#atlas-rows`} prefetch={false}>{type} · {countByType.get(type)}</Link>
      </li>)}</ul>
    </section>}
    <form className={styles.filters} action={path + "#atlas-rows"}>
      {filters.map(filter => <label key={filter.key}>{filter.label}
        <select name={filter.key} defaultValue={filter.selected}>
          <option value="">{t("全部", "全部", "All")}</option>
          {filter.options.map(option => <option key={option}>{option}</option>)}
        </select>
      </label>)}
      {showCox && <label>{t("顺序", "順序", "Sort by")}<select name="sort" defaultValue={order}>
        <option value="">{t("人物名", "人物名", "Name")}</option>
        <option value="childhood">{t("童年修正估值", "童年修正估值", "Corrected childhood estimate")}</option>
        <option value="youth">{t("青年修正估值", "青年修正估值", "Corrected youth estimate")}</option>
      </select></label>}
      <button type="submit">{t("应用筛选", "套用篩選", "Apply filters")}</button>
      <Link href={path} prefetch={false}>{t("清除筛选", "清除篩選", "Clear filters")}</Link>
    </form>
    <div className={styles.scroll} tabIndex={0} role="region" aria-labelledby="atlas-rows">
      <table data-history-atlas={atlas}>
        <caption id="atlas-rows">{t(`显示 ${rows.length} / ${roster.length} 位人物`, `顯示 ${rows.length} / ${roster.length} 位人物`, `Showing ${rows.length} of ${roster.length} figures`)}</caption>
        {showCox && <><colgroup span={3} /><colgroup span={5} /><colgroup span={5} /></>}
        <thead>
          {showCox ? <>
            <tr>
              <th scope="col" rowSpan={2}>{t("人物", "人物", "Figure")}</th>
              <th scope="col" rowSpan={2}>{t("原表位置", "原表位置", "Table and row")}</th>
              <th scope="col" rowSpan={2}>{t("显著度排名", "知名度排名", "Eminence rank")}</th>
              <th scope="colgroup" colSpan={5}>{t("截至 17 岁 · A I／B I", "截至 17 歲 · A I／B I", "Through age 17 · A I / B I")}</th>
              <th scope="colgroup" colSpan={5}>{t("截至 26 岁 · A II／B II", "截至 26 歲 · A II／B II", "Through age 26 · A II / B II")}</th>
            </tr>
            <tr>{["I", "II"].flatMap(period => periodColumns.map(label => <th key={period + label} scope="col">{label}</th>))}</tr>
          </> : <tr>
            <th scope="col">{t("人物", "人物", "Figure")}</th>
            <th scope="col">{t("传记人格", "傳記人格", "Biographical type")}</th>
            <th scope="col">{t("时代", "時代", "Era")}</th>
            <th scope="col">{t("地区", "地區", "Region")}</th>
            <th scope="col">{t("领域", "領域", "Field")}</th>
          </tr>}
        </thead>
        <tbody>{rows.map(row => <tr key={row.id} data-history-atlas-figure={row.id}>
          <th scope="row"><Link href={globalHistoryResultPath(locale, row.id)} prefetch={false}>{row.name}</Link></th>
          {row.cox && showCox ? <>
            <td>{row.cox.table} · {row.cox.sheet_row}</td><td>{row.cox.rank}</td>
            <td>{row.cox.ai}</td><td>±{row.cox.ai_pe}</td><td>{row.cox.ai_grade}</td><td>{row.cox.ai_reliability.toFixed(2)}</td><td>{row.cox.childhood_corrected}</td>
            <td>{row.cox.aii}</td><td>±{row.cox.aii_pe}</td><td>{row.cox.aii_grade}</td><td>{row.cox.aii_reliability.toFixed(2)}</td><td>{row.cox.youth_corrected}</td>
          </> : <>
            <td><Link href={`/${locale}/personality/${row.type.toLowerCase()}`} prefetch={false}>{row.type}</Link></td>
            <td>{row.era}</td><td>{row.region}</td><td>{row.field}</td>
          </>}
        </tr>)}</tbody>
      </table>
    </div>
  </Container>;
}
