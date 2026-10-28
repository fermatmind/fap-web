"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isCareerMatchConfigurationValid } from "@/lib/questionnaires/careerMatch";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerInterestComparisonRole } from "@/lib/career/api/fetchCareerInterestComparisonRole";
import {
  compareCareerInterestThemes, readCareerInterestDirectory, readCareerInterestRole,
  type CareerInterestOption, type CareerInterestRole, type CareerInterestTheme,
} from "@/lib/career/adapters/adaptCareerInterestComparison";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";

const button = "min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};
type RoleRead = { status: "available"; role: CareerInterestRole } | { status: "missing" | "invalid" | "error"; option: CareerInterestOption };
type Outcome = { themes: CareerInterestTheme[]; roles: RoleRead[] };

export function CareerMatchClient({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isCareerMatchConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "职业比较工具内容暂不可用。" : "The career comparison content is unavailable."}</p>;
  return <ValidCareerMatchClient key={locale} quiz={quiz} locale={locale} />;
}

function ValidCareerMatchClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const metrics = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [started, setStarted] = useState(false), [listStatus, setListStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [directory, setDirectory] = useState<CareerInterestOption[] | null>(null), [themes, setThemes] = useState<CareerInterestTheme[]>([]);
  const [picks, setPicks] = useState(["", "", ""]), [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false), [outcome, setOutcome] = useState<Outcome | null>(null);
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const revision = useRef(0), heading = useRef<HTMLHeadingElement>(null);
  const invalidate = useCallback(() => { revision.current++; setBusy(false); setOutcome(null); setMessage(""); setManual(""); }, []);
  const clear = useCallback(() => {
    invalidate(); setStarted(false); setListStatus("idle"); setDirectory(null); setThemes([]); setPicks(["", "", ""]); setFilter("");
  }, [invalidate]);
  useEffect(() => {
    const leave = () => clear(), restore = (event: PageTransitionEvent) => { if (event.persisted) clear(); };
    const cancelPendingReads = () => { revision.current++; };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { cancelPendingReads(); window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (outcome) heading.current?.focus(); }, [outcome]);
  const complete = outcome !== null && outcome.roles.every(r => r.status === "available");
  useEntertainmentResultView(metrics.view, complete);

  async function start() {
    if (!started) metrics.start();
    setStarted(true); setListStatus("loading"); setDirectory(null); setMessage("");
    const requestRevision = ++revision.current;
    try {
      const payload = await fetchCareerJobIndex({ locale });
      if (revision.current !== requestRevision) return;
      const options = readCareerInterestDirectory(payload, locale);
      if (options === null) { setListStatus("error"); return; }
      setDirectory(options); setListStatus("ready");
    } catch { if (revision.current === requestRevision) setListStatus("error"); }
  }

  async function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); invalidate();
    if (themes.length === 0) { setMessage(zh ? "请至少选择一个兴趣主题。" : "Choose at least one interest theme."); return; }
    const slugs = picks.filter(Boolean), chosen = slugs.map(slug => directory?.find(row => row.slug === slug));
    if (!picks[0] || !picks[1] || slugs.length < 2 || slugs.length > 3 || new Set(slugs).size !== slugs.length || chosen.some(x => !x)) {
      setMessage(zh ? "请从目录选择两个或三个不同职业。" : "Choose two or three different occupations from the list."); return;
    }
    const selectedThemes = themes.slice(), requestRevision = revision.current;
    setBusy(true);
    const roles = await Promise.all(chosen.map(async option => {
      try {
        const raw = await fetchCareerInterestComparisonRole({ locale, slug: option!.slug });
        if (raw === null) return { status: "missing", option: option! } as const;
        const role = readCareerInterestRole(raw, locale, option!.slug);
        return role ? { status: "available", role } as const : { status: "invalid", option: option! } as const;
      } catch { return { status: "error", option: option! } as const; }
    }));
    if (revision.current !== requestRevision) return;
    setBusy(false); setOutcome({ themes: selectedThemes, roles });
    if (roles.every(r => r.status === "available")) metrics.complete();
  }

  async function share() {
    const text = `${quiz.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/career-match`, copiedRevision = revision.current;
    try {
      await navigator.clipboard.writeText(text); if (copiedRevision !== revision.current) return;
      metrics.share(); setManual(""); setMessage(zh ? "已复制公开入口，不含兴趣选择或所选职业。" : "Copied the public entry, without interest selections or selected roles.");
    } catch {
      if (copiedRevision !== revision.current) return;
      setManual(text); setMessage(zh ? "可从下方手动复制公开入口。" : "Copy the public entry manually below.");
    }
  }

  const themeNames = (ids: readonly string[]) => quiz.directions.filter(d => ids.includes(d.id)).map(d => d.title[locale]).join(zh ? "；" : "; ");
  const needle = filter.trim().toLocaleLowerCase(locale === "zh" ? "zh-CN" : "en"), visibleOptions = directory?.filter(row => row.title.toLocaleLowerCase(locale === "zh" ? "zh-CN" : "en").includes(needle) || picks.includes(row.slug)) ?? [];
  return <section id="take-test" data-career-match-client aria-busy={busy || listStatus === "loading"} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7" aria-labelledby="career-match-input-title">
    {metrics.consent}
    <h2 id="career-match-input-title" className="text-2xl font-semibold">{zh ? "选择兴趣，比较真实职业" : "Choose interests and compare real roles"}</h2>
    <p className="my-4 leading-7">{quiz.instructions![locale]}</p>
    <p className="my-4 text-sm leading-7 text-slate-600">{zh ? "输入只留在本页内存中，清除、离开、刷新或换语会移除。目录读取不包含兴趣选择；职业名筛选文字不会发送。" : "Inputs stay in this page’s memory and clear when you clear, leave, reload or switch language. Reading the list does not send interests; title-filter text is not sent."}</p>
    {(!started || listStatus === "error") && <button type="button" disabled={!ready || listStatus === "loading"} className={button} onClick={start}>{!started ? (zh ? "开始比较" : "Start comparison") : (zh ? "重试读取职业目录" : "Retry reading the career list")}</button>}
    {started && (listStatus !== "ready" || !directory?.length) && <button type="button" className={`${button} ml-3`} onClick={clear}>{zh ? "退出并清除本次比较" : "Exit and clear this comparison"}</button>}
    {listStatus === "loading" && <p className="my-4" role="status">{zh ? "正在读取当前公开职业目录…" : "Reading the current public occupation list…"}</p>}
    {listStatus === "error" && <p className="my-4" role="status">{zh ? "当前语言的职业目录暂不可用，请重试。你的兴趣没有提交。" : "The career list for this language is unavailable. Retry the read; your interests have not been submitted."}</p>}
    {listStatus === "ready" && directory?.length === 0 && <p className="my-4" role="status">{zh ? "当前语言暂无可供选择的公开职业。" : "There are no public occupations available for selection in this language."}</p>}
    {listStatus === "ready" && !!directory?.length && <form onSubmit={compare} noValidate>
      <fieldset className="my-6 min-w-0" disabled={!ready}>
        <legend className="font-semibold">{zh ? "1. 选择想探索的主题（1—6项，可保留并列）" : "1. Choose themes to explore (1–6; keep relevant ties)"}</legend>
        <div className="mt-3 space-y-2">{quiz.directions.map(d => <label key={d.id} className="flex min-h-12 items-start gap-3 rounded-lg border border-slate-200 p-3">
          <input data-interest-theme={d.id} type="checkbox" className="mt-1" checked={themes.includes(d.id as CareerInterestTheme)} onChange={event => { invalidate(); setThemes(event.target.checked ? [...themes, d.id as CareerInterestTheme] : themes.filter(x => x !== d.id)); }} />
          <span>{d.id} · {d.title[locale]}</span>
        </label>)}</div>
      </fieldset>
      <fieldset className="my-6 min-w-0 space-y-4" disabled={!ready}>
        <legend className="mb-3 font-semibold">{zh ? "2. 选择两个或三个不同职业" : "2. Choose two or three different occupations"}</legend>
        <p className="text-sm leading-7">{zh ? `本次目录有${directory.length}个公开职业名；只会按需读取你选中的档案，不按兴趣自动挑选或排名。` : `This list contains ${directory.length} public occupation titles. Only your chosen profiles are read; interests do not automatically choose or rank roles.`}</p>
        <div><label className="mb-2 block font-medium" htmlFor="career-match-filter">{zh ? "本地筛选职业名称（可选）" : "Filter occupation titles locally (optional)"}</label><input id="career-match-filter" type="search" autoComplete="off" maxLength={80} value={filter} className="min-h-12 w-full min-w-0 rounded-lg border border-slate-300 p-3" onChange={event => setFilter(event.target.value)} /></div>
        {picks.map((pick, i) => <div key={i}>
          <label className="mb-2 block font-medium" htmlFor={`career-match-role-${i}`}>{zh ? `职业${i + 1}${i === 2 ? "（可选）" : ""}` : `Occupation ${i + 1}${i === 2 ? " (optional)" : ""}`}</label>
          <select id={`career-match-role-${i}`} value={pick} className="min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3" onChange={event => { invalidate(); setPicks(picks.map((x, index) => index === i ? event.target.value : x)); }}>
            <option value="">{zh ? "请选择" : "Choose an occupation"}</option>{visibleOptions.map(row => <option key={row.slug} value={row.slug}>{row.title}</option>)}
          </select>
        </div>)}
      </fieldset>
      <div className="flex flex-wrap gap-3"><button disabled={!ready || busy} className={button} type="submit">{busy ? (zh ? "正在读取所选职业…" : "Reading selected profiles…") : (zh ? "查看主题比较" : "Compare interest themes")}</button><button type="button" className={button} onClick={clear}>{zh ? "退出并清除本次比较" : "Exit and clear this comparison"}</button></div>
    </form>}
    <p data-career-match-message role="status" className="my-4 leading-7">{message}</p>
    {outcome && <section data-career-match-result className="mt-8 space-y-6" aria-labelledby="career-match-result-title">
      <h2 id="career-match-result-title" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{complete ? quiz.resultHeading![locale] : (zh ? "比较尚不完整：部分职业信息不可用" : "Comparison incomplete: some role information is unavailable")}</h2>
      <p className="leading-7">{zh ? "本次选择：" : "Your selection: "}{themeNames(outcome.themes)}</p>
      <p className="text-sm leading-7 text-slate-600">{zh ? "共同主题是继续研究的线索，不是能力、录用、收入或职业适配分。未选主题不等于不喜欢；没有交集也不能排除一个职业。职业按你的选择顺序展示。" : "Shared themes are clues for further exploration, not ability, hiring, income or job-fit scores. An unselected theme does not mean dislike, and no intersection does not rule out a career. Roles remain in your selection order."}</p>
      {outcome.roles.map(read => {
        const slug = read.status === "available" ? read.role.slug : read.option.slug;
        if (read.status !== "available") return <article data-career-match-role={slug} data-career-read-status={read.status} key={slug} className="rounded-lg border border-amber-200 p-4 leading-7">
          <h3 className="text-xl font-semibold">{read.option.title}</h3><p className="my-3">{read.status === "error" ? (zh ? "本次读取失败，请重试。" : "This read failed. Retry the comparison.") : (zh ? "当前职业兴趣信息不可用，无法计算交集。" : "Current occupational interest information is unavailable; no intersection is calculated.")}</p>
          <a className="inline-block min-h-11 py-2 underline" href={`/${locale}/career/jobs/${slug}`}>{zh ? "打开职业页查看当前状态" : "Open the occupation page for its current status"}</a>
        </article>;
        const role = read.role, compared = compareCareerInterestThemes(outcome.themes, role.code)!;
        return <article key={slug} data-career-match-role={slug} data-career-read-status="available" className="space-y-4 rounded-lg border border-slate-200 p-4 leading-7 sm:p-6">
          <h3 className="text-xl font-semibold">{role.title}</h3>
          <p>{zh ? "已发布职业兴趣代码：" : "Published occupational interest code: "}<strong data-career-interest-code>{role.code}</strong><br />{role.codeLabel}</p>
          <p data-career-shared-themes className="rounded-lg bg-violet-50 p-3"><strong>{zh ? "共同主题：" : "Shared themes: "}</strong>{compared.shared.length ? themeNames(compared.shared) : (zh ? "没有共同的所选主题" : "No shared selected theme")}</p>
          <p data-career-outside-themes><strong>{zh ? "本次选择中未出现在该短代码里的主题：" : "Selected themes outside this short code: "}</strong>{compared.selectedOutsideCode.length ? themeNames(compared.selectedOutsideCode) : (zh ? "无" : "None")}</p>
          <p>{role.interest}</p><p>{role.fitInterest}</p>
          <a className="inline-block min-h-11 py-2 underline" href={`/${locale}/career/jobs/${slug}`}>{zh ? "阅读完整职业档案、任务与入门要求" : "Read the complete career profile, tasks and entry requirements"}</a>
        </article>;
      })}
      <p className="leading-7">{zh ? "可以从完整档案选择一项普通任务，私下核对吸引你的部分与仍需了解的条件；也可以在这里结束。" : "Optionally choose one ordinary task from a complete profile and privately note its appeal and the conditions you still need to understand. You can also finish here."}</p>
      <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={share}>{zh ? "复制公开入口" : "Copy public entry"}</button><button type="button" className={button} onClick={clear}>{zh ? "清除并重新比较" : "Clear and compare again"}</button></div>
    </section>}
    {manual && <div className="my-4"><label className="block" htmlFor="career-match-copy">{zh ? "手动复制的公开入口" : "Public entry for manual copying"}</label><textarea id="career-match-copy" readOnly value={manual} className="mt-2 min-h-28 w-full rounded-lg border p-3" /></div>}
  </section>;
}
