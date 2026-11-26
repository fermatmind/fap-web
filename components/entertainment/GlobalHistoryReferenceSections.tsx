import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { globalHistoryAtlasPath } from "@/lib/entertainment/global-history/config";
import { coxStudy, coxTranscription, getCoxEstimate, resultCopy } from "@/lib/entertainment/global-history/result-v2";
import { listedWithoutCoxEstimate } from "@/lib/entertainment/global-history/reference";
import styles from "./GlobalHistoryResultV2.module.css";

export function coxCoverageCopy(id: string, name: string, birth: number, locale: DisplayLocale) {
  const t = (zh: string, tw: string, en: string) => resultCopy(zh, tw, en)[locale];
  if (listedWithoutCoxEstimate.has(id)) {
    return [
      t(`表 12A 列有${name}，但没有给出估值。`, `表 12A 列有${name}，但未提供估值。`, `Table 12A lists ${name} without an estimate.`),
      t("原表注明早年资料不足。", "原表註明早年資料不足。", "The table notes insufficient evidence about his early years."),
    ];
  }
  const knownOutsideWindow = birth !== 0 && (birth < 1450 || birth > 1850);
  if (knownOutsideWindow) {
    const year = birth < 0 ? t(`公元前 ${-birth} 年`, `西元前 ${-birth} 年`, `${-birth} BCE`) : String(birth);
    return [
      t(`表 12A／12B 没有${name}的估值。`, `表 12A／12B 未提供${name}的估值。`, `Tables 12A and 12B give ${name} no estimate.`),
      t(`公开档案所载出生年为 ${year}，在 Cox 研究讨论的 1450–1850 年出生范围之外。`,
        `公開檔案所載出生年為 ${year}，在 Cox 研究討論的 1450–1850 年出生範圍以外。`,
        `The biographical record gives a birth year of ${year}, outside the study’s 1450–1850 birth window.`),
    ];
  }
  return [
    t(`表 12A／12B 的入选名录未列入${name}。`, `表 12A／12B 的入選名單未列入${name}。`, `${name} is absent from the selection printed in Tables 12A and 12B.`),
    birth === 0
      ? t("档案没有确切出生年。原书也未给出个别筛选理由。", "檔案沒有確切出生年。原書也未交代個別篩選理由。", "The biographical record has no exact birth year. The book gives no individual screening reason.")
      : t(`出生年 ${birth} 在 1450–1850 年范围内。出生范围只是抽样条件之一，原书未给出个别筛选理由。`,
        `出生年 ${birth} 在 1450–1850 年範圍內。出生範圍只是抽樣條件之一，原書未交代個別篩選理由。`,
        `The birth year, ${birth}, falls within 1450–1850. The study used additional selection criteria and gives no individual screening reason.`),
  ];
}

export function GlobalHistoryCoxReference({ locale, estimate, coverage }: {
  locale: DisplayLocale;
  estimate: ReturnType<typeof getCoxEstimate>;
  coverage: readonly string[];
}) {
  const t = (zh: string, tw: string, en: string) => resultCopy(zh, tw, en)[locale];
  const prefix = estimate?.group === "B" ? "B" : "A";
  const method = t(
    "原书估值来自传记记录，沿用早期比率智商框架。比率智商和现代离差智商无法直接换算。",
    "原書估值來自傳記紀錄，沿用早期比率智商框架。比率智商與現代離差智商無法直接換算。",
    "The book estimates historical ratio IQ from biographical records. Ratio IQ cannot be converted directly into a modern deviation IQ.",
  );
  return <section className={styles.section} id="cox-1926" aria-labelledby="cox-reference-heading">
    <h2 id="cox-reference-heading">{t("Cox（1926）原表核对", "Cox（1926）原表核對", "Cox (1926) table check")}</h2>
    {estimate ? <>
      <div className={styles.tableScroll}>
        <table className={styles.facts} aria-labelledby="cox-reference-heading">
          <thead><tr>
            <th scope="col">{t("原表字段", "原表欄位", "Printed field")}</th>
            <th scope="col">{prefix} I · {t("截至 17 岁", "截至 17 歲", "through age 17")}</th>
            <th scope="col">{prefix} II · {t("截至 26 岁", "截至 26 歲", "through age 26")}</th>
          </tr></thead>
          <tbody>
            <tr><th scope="row">{t("原表与转录行位", "原表與轉錄列位", "Table and transcription row")}</th><td colSpan={2}>{estimate.table} · {estimate.sheet_row}</td></tr>
            <tr><th scope="row">{t("组内显著度排名", "組內知名度排名", "Eminence rank within group")}</th><td colSpan={2}>{estimate.group} · {estimate.rank}</td></tr>
            <tr><th scope="row">{t("未修正估值", "未修正估值", "Original estimate")}</th><td>{estimate.ai}</td><td>{estimate.aii}</td></tr>
            <tr><th scope="row">{t("概然误差（PE）", "概然誤差（PE）", "Probable error (PE)")}</th><td>±{estimate.ai_pe}</td><td>±{estimate.aii_pe}</td></tr>
            <tr><th scope="row">{t("史料等级", "史料等級", "Evidence grade")}</th><td>{estimate.ai_grade}</td><td>{estimate.aii_grade}</td></tr>
            <tr><th scope="row">{t("史料信度（r）", "史料信度（r）", "Evidence reliability (r)")}</th><td>{estimate.ai_reliability.toFixed(2)}</td><td>{estimate.aii_reliability.toFixed(2)}</td></tr>
            <tr><th scope="row">{t("统计修正估值", "統計修正估值", "Corrected estimate")}</th><td>{estimate.childhood_corrected}</td><td>{estimate.youth_corrected}</td></tr>
            <tr><th scope="row">{t("方法边界", "方法邊界", "Method limits")}</th><td colSpan={2}>{method}</td></tr>
          </tbody>
        </table>
      </div>
      <p className={styles.note}>{t("第二阶段加入 17–26 岁的传记资料。概然误差与史料信度属于原表口径。", "第二階段加入 17–26 歲的傳記資料。概然誤差與史料信度依原表定義。", "The second estimate adds biographical evidence from ages 17–26. Probable error and reliability follow the printed definitions.")}</p>
    </> : <p className={styles.prose}>{coverage.join(" ")}</p>}
    <div className={styles.references}>
      <a href={coxStudy}>{t("查看原书折页", "查看原書摺頁", "View the original fold-outs")}</a>
      <a href={coxTranscription} download>{t("下载校勘 CSV", "下載校勘 CSV", "Download the checked CSV")}</a>
      <Link href={globalHistoryAtlasPath(locale,"cox-1926")} prefetch={false}>{t("查看 Cox 图鉴与方法", "查看 Cox 圖鑑與方法", "Open the Cox atlas and method")}</Link>
    </div>
  </section>;
}
