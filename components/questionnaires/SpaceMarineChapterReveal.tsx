"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { chapterHobbyLens, chapterShareCardPath, chapterPortraitPath, chapterChoiceReasons, chapterScope } from "@/lib/questionnaires/spaceMarineChapters";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import { SpaceMarinePersonalCard } from "./SpaceMarinePersonalCard";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";

export function SpaceMarineChapterReveal({ quiz, result, locale, answers }: {
  quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }>; locale: Locale; answers?: QuestionnaireAnswers;
}) {
  const zh = locale === "zh";
  const [preview, setPreview] = useState<string>();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const matched = quiz.profiles.filter(profile => result.profileIds.includes(profile.id));
  async function download(id: string) {
    setSaving(true); setMessage("");
    try {
      const response = await fetch(chapterShareCardPath(locale, id, quiz.version));
      if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) throw new Error("unavailable");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `fermatmind-${id}-${locale}.png`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(zh ? "分享卡已准备下载。" : "Your share card is ready to download.");
    } catch {
      setMessage(zh ? "暂时无法下载。可打开公开分享图保存，或使用下方的复制结果与链接。" : "Download is unavailable. Open the public card to save it, or use Copy result and link below.");
    } finally { setSaving(false); }
  }
  return <section data-space-marine-reveal className="my-6 space-y-5 rounded-xl border border-slate-300 bg-slate-50 p-5 sm:p-6" aria-label={zh ? "本次战团结果" : "Your Chapter reveal"}>
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{zh ? "非官方战团爱好读法" : "Unofficial Chapter hobby reading"}</p>
    <h3 className="text-2xl font-semibold leading-snug">{matched.map(profile => profile.title[locale]).join(zh ? "、" : " · ")}</h3>
    <p className="leading-7">{matched.length === 1
      ? (zh ? "这是你在本次18题中选得最多的战团视角。" : "This is the Chapter perspective you chose most often across these eighteen items.")
      : (zh ? `${matched.length}项共同最高，全部保留。可以分别读，没有额外的胜出者。` : `All ${matched.length} Chapters share the highest count. Read each; there is no extra winner.`)}</p>
    <p className="text-sm leading-7 text-slate-600">{chapterScope[locale]}</p>
    <SpaceMarinePersonalCard quiz={quiz} result={result} locale={locale} />
    <ul className="grid gap-3 sm:grid-cols-2">{matched.map(profile => {
      const lens = chapterHobbyLens(profile.id);
      const reasons = chapterChoiceReasons(quiz, profile.directionIds[0], answers);
      return <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-4" style={{ borderTop: `4px solid ${lens?.color}` }}>
        <Image unoptimized src={chapterPortraitPath(profile.id)!} width={768} height={768} alt={zh ? `${profile.title.zh}的原创创作情境` : `Original creative scene for ${profile.title.en}`} className="mb-4 h-auto w-full rounded-lg" />
        <a className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4" href={`#animal-title-${profile.id}`}>{profile.title[locale]}</a>
        <p className="leading-7">{lens?.[locale]}</p>
        <p className="text-sm leading-6 text-slate-600">{zh ? "本次选中" : "Chosen this time"} {result.counts[profile.directionIds[0]]} / 12</p>
        {reasons.length > 0 && <details className="my-4 space-y-3 border-t border-slate-200 pt-3" data-space-marine-reasons={profile.id}>
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "为什么得到这个战团视角？" : "Why this Chapter lens?"}</summary>
          <p className="text-sm leading-6">{zh ? `以下是你真正选中的场景。每项为“${lens?.zh}”加1次，它属于本次最高计数；这不是战团人格鉴定。` : `These are scenes you actually chose. Each added one to “${lens?.en}”, one of this attempt’s highest counts; this is not a Chapter personality assessment.`}</p>
          <ol className="space-y-4 text-sm leading-7">{reasons.map(({number, question, option}) => <li key={question.id}>
            <p className="font-semibold">{zh ? `第${number}题场景：` : `Item ${number} scene: `}{question.prompt[locale]}</p>
            <p>{zh ? "你选择：" : "You chose: "}<q>{option.label[locale]}</q></p>
          </li>)}</ol>
        </details>}
        <Link prefetch={false} className="inline-flex min-h-11 items-center text-sm underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读公开指南" : "Read public guide"}</Link>
        <button type="button" className="block min-h-11 text-left text-sm font-semibold underline" aria-expanded={preview === profile.id} onClick={() => { setPreview(preview === profile.id ? undefined : profile.id); setMessage(""); }}>{zh ? "预览公开指南卡" : "Preview public guide card"} · {profile.title[locale]}</button>
    {preview === profile.id && <div className="space-y-3" data-space-marine-share-card>
      <Image unoptimized width={1200} height={630} className="h-auto w-full rounded-lg" src={chapterShareCardPath(locale, preview, quiz.version)} alt={`${quiz.profiles.find(profile => profile.id === preview)?.title[locale]} · ${chapterHobbyLens(preview)?.[locale]}`} onError={() => setMessage(zh ? "分享图暂时无法显示，可使用结果文字与公开指南链接。" : "The card could not load. You can still copy the result text and public guide link.")} />
      <div className="flex flex-wrap gap-4">
        <button type="button" disabled={saving} className="min-h-11 rounded-lg border border-slate-400 bg-white px-4 py-2 font-semibold disabled:opacity-50" onClick={() => void download(preview)}>{zh ? "下载公开指南卡" : "Download public guide card"}</button>
        <a className="inline-flex min-h-11 items-center underline" href={chapterShareCardPath(locale, preview, quiz.version)} target="_blank" rel="noopener">{zh ? "打开分享图（新标签页）" : "Open card (new tab)"}</a>
      </div>
    </div>}
      </li>;
    })}</ul>
    <p className="text-sm leading-6 text-slate-600">{zh ? "次数来自这份题本中的选择，不是匹配百分比或官方归属。公开指南卡只展示公开战团名称与爱好视角，不含答案、计数或个人资料；人物图为本站原创创作情境，并非官方角色或徽章。" : "Counts describe choices in this bank, not match percentages or official membership. Public guide cards show a public Chapter name and hobby lens, without answers, counts or personal details. The original character scenes are not official characters or insignia."}</p>

    {message && <p role="status" className="text-sm leading-6">{message}</p>}
  </section>;
}
