"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./RiasecReadingReport.module.css";

// A page-memory note authored by the reader, separate from measured results.
export function RiasecTrialRecord({ locale, activities }: { locale: Locale; activities: string[] }) {
  const zh = locale === "zh";
  const t = (cn: string, en: string) => zh ? cn : en;
  const [notes, setNotes] = useState<Record<string, string>>({});
  const fields = [
    ["task", t("我愿意反复做或试做的活动／真实任务", "An activity or real task I would repeat or try")],
    ["source", t("职业资料：职业名、任务、环境、来源、地区与年份", "Career evidence: role, task, setting, source, region and year")],
    ["condition", t("待核现实条件：技能证据、资格、地区、时间或成本", "Conditions to verify: skill evidence, qualifications, location, time or cost")],
    ["trial", t("下一次试做：做什么、何时做、留下什么作品／反馈、何时复盘", "Next trial: task, date, work sample or feedback, and review date")],
  ];
  const record = [
    t("本人探索记录（不是测评分数或职业推荐）", "My exploration record (not measured scores or a career recommendation)"),
    `${t("我选择的活动", "Activities I selected")}:\n${activities.join("\n")}`,
    ...fields.map(([id, label]) => `${label}:\n${notes[id] ?? ""}`),
  ].join("\n\n");
  return <section className={styles.trialRecord} aria-labelledby="riasec-trial-title">
    <h3 id="riasec-trial-title">{t("记录一次现实试做", "Record a real-world trial")}</h3>
    <p>{t("先选一项愿意尝试的活动，再从职业档案中核对一个真实任务与一个待核条件。这里由你填写，可留空；只在当前页面内存保留，刷新或离开可能丢失。可手动复制下方记录，或打开现有工作表继续整理。", "Choose an activity, then check one real task and one condition in a career profile. These optional notes are yours and stay in this page’s memory; refreshing or leaving may lose them. Manually copy the record below or continue in the existing worksheet.")}</p>
    {activities.length ? <ul aria-label={t("已选活动", "Selected activities")}>{activities.map(activity => <li key={activity}>{activity}</li>)}</ul> : null}
    {fields.map(([id, label]) => <label key={id} className={styles.noteField} htmlFor={`riasec-trial-${id}`}>
      <span>{label}</span>
      <textarea id={`riasec-trial-${id}`} rows={3} value={notes[id] ?? ""} onChange={event => setNotes(previous => ({ ...previous, [id]: event.target.value }))} />
    </label>)}
    <label className={styles.noteField} htmlFor="riasec-trial-preview">
      <span>{t("本人记录预览（可选择后手动复制）", "My record preview (select to copy manually)")}</span>
      <textarea id="riasec-trial-preview" rows={9} value={record} readOnly />
    </label>
    <p>{t("兴趣不等于技能、资格、薪资或录用概率。无法核实的资料标为未知；无需使用AI也能完成这次探索。", "Interests do not establish skills, qualifications, salary or hiring probability. Mark unverified information as unknown. You can complete this exploration without AI.")}</p>
  </section>;
}
