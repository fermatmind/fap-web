"use client";

import { useState } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "./RiasecReadingReport.module.css";

// A page-memory note authored by the reader, separate from measured results.
export function RiasecTrialRecord({ locale, activities, careerName }: { locale: DisplayLocale; activities: string[]; careerName?: string }) {
  const t = (cn: string, en: string, tw: string) => locale === "zh-TW" ? tw : locale === "zh" ? cn : en;
  const [notes, setNotes] = useState<Record<string, string>>({});
  const fields = [
    ["task", t("我愿意反复做或试做的活动／真实任务", "An activity or real task I would repeat or try", "我願意反覆做或試做的活動／實際任務")],
    ["source", t("职业资料：职业名、任务、环境、来源、地区与年份", "Career evidence: role, task, setting, source, region and year", "職業資料：職業名稱、任務、環境、來源、地區與年份")],
    ["condition", t("待核现实条件：技能证据、资格、地区、时间或成本", "Conditions to verify: skill evidence, qualifications, location, time or cost", "待確認的條件：技能證明、資格、地區、時間或成本")],
    ["trial", t("下一次试做：做什么、何时做、留下什么作品／反馈、何时复盘", "Next trial: task, date, work sample or feedback, and review date", "下次試做：做什麼、何時做、留下什麼作品或回饋，以及何時回顧")],
  ];
  const record = [
    t("本人探索记录（由本人填写，与测量事实分开）", "My exploration record (my own notes, separate from measured results)", "我的探索紀錄（由我填寫，與測評結果分開）"),
    ...(careerName ? [careerName] : []),
    `${t("我选择的活动", "Activities I selected", "我選擇的活動")}:\n${activities.join("\n")}`,
    ...fields.map(([id, label]) => `${label}:\n${notes[id] ?? ""}`),
  ].join("\n\n");
  return <section className={styles.trialRecord} aria-labelledby="riasec-trial-title">
    <h3 id="riasec-trial-title">{t("记录一次现实试做", "Record a real-world trial", "記錄一次實際試做")}{careerName ? ` · ${careerName}` : ""}</h3>
    <p>{t("先选一项愿意尝试的活动，再从职业档案中核对一个真实任务与一个待核条件。这里由你填写，可留空；只在当前页面内存保留，刷新或离开可能丢失。可手动复制下方记录，或打开现有工作表继续整理。", "Choose an activity, then check one real task and one condition in a career profile. These optional notes are yours and stay in this page’s memory; refreshing or leaving may lose them. Manually copy the record below or continue in the existing worksheet.", "先選一項願意嘗試的活動，再到職涯檔案確認一項實際任務和一項入行條件。可自行填寫或留白。紀錄只留在目前頁面，重新整理或離開可能會遺失。你可以手動複製下方紀錄，或用工作表繼續整理。")}</p>
    {activities.length ? <ul aria-label={t("已选活动", "Selected activities", "已選活動")}>{activities.map(activity => <li key={activity}>{activity}</li>)}</ul> : null}
    {fields.map(([id, label]) => <label key={id} className={styles.noteField} htmlFor={`riasec-trial-${id}`}>
      <span>{label}</span>
      <textarea id={`riasec-trial-${id}`} rows={3} value={notes[id] ?? ""} onChange={event => setNotes(previous => ({ ...previous, [id]: event.target.value }))} />
    </label>)}
    <label className={styles.noteField} htmlFor="riasec-trial-preview">
      <span>{t("本人记录预览（可选择后手动复制）", "My record preview (select to copy manually)", "我的紀錄預覽（可選取後手動複製）")}</span>
      <textarea id="riasec-trial-preview" rows={9} value={record} readOnly />
    </label>
    <p>{t("兴趣不等于技能、资格、薪资或录用概率。无法核实的资料标为未知；无需使用AI也能完成这次探索。", "Interests do not establish skills, qualifications, salary or hiring probability. Mark unverified information as unknown. You can complete this exploration without AI.", "興趣與技能、資格、薪資或錄取機率是不同的資訊。無法查證的資料可標記為未知。你可以自行完成這次探索。")}</p>
  </section>;
}
