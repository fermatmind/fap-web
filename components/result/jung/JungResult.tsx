"use client";

import { useEffect, useState } from "react";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import type { DisplayLocale } from "@/lib/i18n/locales";
import Link from "next/link";
import { JungReport } from "./JungReportPreview";
import { readJungArchetypeScores } from "./jungReportAssets";

const archetypeIds = ["hero", "sage", "explorer", "creator", "ruler", "caregiver", "magician", "lover", "jester", "everyperson", "innocent", "rebel"];
const functionIds = ["Ni", "Ne", "Ti", "Te", "Fi", "Fe", "Si", "Se"];

type Axis = { left: string; right: string; difference: number; lean: string | null };
type Candidate = { type: string; stack: string[]; fit: number };
type Projection = {
  scores: Record<string, number>;
  reading?: {archetypes: Record<string, string[]>; functions: Record<string, string[]>};
  primary?: string[];
  secondary?: string[];
  near_leaders?: string[];
  axes?: Axis[];
  candidates?: Candidate[];
  stability?: string;
};

const own = (object: object, key: string) => Object.hasOwn(object, key);

export function JungResult({ scale, locale, displayLocale = locale, payload }: { scale: string; locale: "zh" | "en"; displayLocale?: DisplayLocale; payload: unknown }) {
  const [converter, setConverter] = useState<((text: string) => string) | null>(null);
  useEffect(() => {
    let active = true;
    if (displayLocale === "zh-TW") void loadTraditionalAssessmentText().then(value => { if (active) setConverter(() => value); });
    return () => { active = false; };
  }, [displayLocale]);
  const copy = (text: string) => displayLocale === "zh-TW" && converter ? converter(text) : text;
  const zh = locale === "zh";
  const archetype = scale === "JUNG_ARCHETYPES";
  if (archetype && displayLocale === "zh") {
    const scores = readJungArchetypeScores(payload);
    return scores ? <JungReport mode="result" scores={scores} /> : <p role="status">当前无法读取报告，请刷新重试。</p>;
  }

  const expected = archetype ? archetypeIds : functionIds;
  const result = payload as Projection | undefined;
  const archetypes = result?.reading?.archetypes ?? {};
  const functions = result?.reading?.functions ?? {};
  if (!result?.scores || !expected.every((key) => typeof result.scores[key] === "number" && Number.isFinite(result.scores[key]) && result.scores[key] >= 0 && result.scores[key] <= 100)) {
    return <p role="status">{zh ? copy("当前无法读取报告，请刷新重试。") : "This report is unavailable. Refresh to try again."}</p>;
  }
  const name = (key: string) => archetype && own(archetypes, key) ? copy(archetypes[key as keyof typeof archetypes][zh ? 0 : 1]) : key;
  const role = (key: string) => own(functions, key) ? copy(functions[key as keyof typeof functions][zh ? 0 : 1]) : "";
  const ranked = [...expected].sort((a, b) => result.scores[b] - result.scores[a]);
  const primary = (result.primary ?? []).filter((key) => own(archetypes, key));
  const secondary = (result.secondary ?? []).filter((key) => own(archetypes, key));
  const scores = (score: number) => new Intl.NumberFormat(zh ? "zh-CN" : "en", { maximumFractionDigits: 1 }).format(score);
  const leader = result.candidates?.[0];

  return (
    <article className="mx-auto max-w-3xl space-y-8 py-8" data-result-visible-root>
      <h1 className="text-3xl font-semibold">{archetype
        ? (zh ? copy("荣格十二原型测评报告") : "Jungian Archetypes Report")
        : (zh ? copy("荣格八维认知功能测评报告") : "Jungian Cognitive Functions Report")}</h1>
      <section aria-labelledby="jung-scores">
        <h2 className="text-xl font-semibold" id="jung-scores">{zh ? copy("本次维度分布") : "Your score profile"}</h2>
        <p>{zh ? copy("每个维度独立换算为 0–100，分数反映本次自评，未使用人群常模。") : "Each dimension uses its own 0–100 scale. Scores reflect this self-report and use no population norms."}</p>
        <ul className="mt-4 grid gap-2">
          {ranked.map((key) => <li key={key} className="grid grid-cols-[minmax(5rem,9rem)_1fr_3rem] items-center gap-2">
            <span>{name(key)}</span>
            <meter className="w-full" min={0} max={100} value={result.scores[key]} aria-label={name(key)} />
            <span>{scores(result.scores[key])}</span>
          </li>)}
        </ul>
      </section>
      {archetype ? <>
        <section>
          <h2 className="text-xl font-semibold">{zh ? copy("主导与辅助原型") : "Primary and secondary archetypes"}</h2>
          {!primary.length ? <p>{zh ? copy("这次各维度很接近。可先比较具体情境。") : "Your scores are close together. Start by comparing specific situations."}</p> : <p>{primary.map(name).join(zh ? "、" : ", ")}{secondary.length ? " + " + secondary.map(name).join(zh ? "、" : ", ") : (primary.length > 1 ? (zh ? copy(" 并列") : " (tied)") : "")}</p>}
          {(result.near_leaders?.length ?? 0) > 1 && <p>{zh ? copy("接近最高分") : "Near the highest score"} · {result.near_leaders?.map(name).join(zh ? "、" : ", ")}</p>}
          {primary.length === 1 && secondary.length > 0 && <p>{zh ? copy("回想一次共同任务：哪种动机让你开始，哪种帮助你继续？两者发生冲突时，你先照顾了什么？") : "Recall a shared task. Which motive got you started and which kept you involved? When they competed, which did you act on first?"}</p>}
        </section>
        {[...primary, ...secondary].map((key) => {
          const reading = archetypes[key as keyof typeof archetypes];
          return <section key={key} className="space-y-2">
            <h2 className="text-xl font-semibold">{name(key)}</h2>
            <p><strong>{zh ? copy("核心渴望") : "Core desire"}</strong> · {copy(reading[zh ? 2 : 3])}</p>
            <p><strong>{zh ? copy("可能担心的事") : "Possible concern"}</strong> · {copy(reading[zh ? 4 : 5])}</p>
            <p><strong>{zh ? copy("过度使用时的盲区") : "When overused"}</strong> · {copy(reading[zh ? 8 : 9])}</p>
            <p><strong>{zh ? copy("团队协作建议") : "Working with a team"}</strong> · {copy(reading[zh ? 6 : 7])}</p>
          </section>;
        })}
        <Link className="underline" href={`/${locale}/career/jobs/technical-writers`}>{zh ? copy("职业任务示例：技术写作者如何把复杂流程解释清楚") : "Example career tasks: how technical writers explain a complex process"}</Link>
      </> : <>
        <section>
          <h2 className="text-xl font-semibold">{zh ? copy("四组功能轴") : "Four function axes"}</h2>
          <ul>{result.axes?.map((axis) => <li key={axis.left}>{axis.left} / {axis.right} · {scores(axis.difference)} · {axis.lean ?? (zh ? copy("接近") : "Close")}</li>)}</ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{zh ? copy("功能栈候选") : "Type candidates by stack fit"}</h2>
          <p>{result.stability === "concentrated" ? (zh ? copy("在此模型下较集中") : "More concentrated in this model") : result.stability === "unstable" ? (zh ? copy("候选容易随小幅分数变化而改变") : "Small score changes could shift the candidates") : (zh ? copy("本次分布不足以给出候选") : "This score profile does not support a candidate list")}</p>
          <ol>{result.candidates?.map((candidate) => <li key={candidate.type}>{candidate.type} · {candidate.stack.join(" → ")}</li>)}</ol>
          {leader && result.stability === "concentrated" && <p>{zh ? copy("候选主导与辅助") : "Candidate dominant and auxiliary"} · {role(leader.stack[0])} · {role(leader.stack[1])}</p>}
          <p>{zh ? copy("先回忆两个具体决定，对照自己如何获取信息、怎样下判断，再看它与四组 MBTI 偏好哪些相符、哪些需要再观察。") : "Recall two decisions and consider how you gathered information and judged the options. Compare those examples with the four MBTI preference pairs."}</p>
          <Link href={`/${locale}/tests/mbti-personality-test-16-personality-types`}>{zh ? copy("查看 MBTI 四组偏好测评") : "Explore the four MBTI preference pairs"}</Link>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{zh ? copy("压力下的情境自查") : "Reflecting on stressful situations"}</h2>
          <p>{zh ? copy("如果同一种做法反复卡住，回想当时忽略了什么原本可用的策略（Loop）。如果压力下的反应和平时明显不同，记下触发事件以及具体影响（Grip）。") : "If you got stuck repeating one approach, recall which normally available strategy you set aside (Loop). If your reaction under pressure differed from your usual response, note the trigger and its concrete impact (Grip)."}</p>
        </section>
      </>}
    </article>
  );
}
