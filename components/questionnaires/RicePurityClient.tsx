"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnairePath, questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { scoreRiceSelections } from "@/lib/questionnaires/ricePurity";
import styles from "./RicePurity.module.css";

export function RicePurityClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  const [adult, setAdult] = useState(false), [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState(false), [review, setReview] = useState(false), [clearing, setClearing] = useState(false);
  const [status, setStatus] = useState(""), [manual, setManual] = useState(false), [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const report = useRef<HTMLDivElement>(null), checklist = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (clearing) dialog.current?.showModal(); }, [clearing]);
  const score = scoreRiceSelections(quiz, selected);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  if (!score) return <p role="alert">{zh ? displayText("清单暂时不可用，请返回介绍页。") : "The checklist is unavailable. Return to the introduction."}</p>;
  const landing = questionnairePath(traditional ? "zh-TW" : locale, quiz.slug), url = `https://fermatmind.com${landing}`;
  const text = zh ? displayText(`我的Rice Purity独立版分数：${score.score}/100（勾选${score.checked}项）。FM Experience 100 v1；不是经典原版，无人格或道德评定。${url}`) : `My independent Rice Purity score: ${score.score}/100 (${score.checked} checked). FM Experience 100 v1; not the classic original or a judgment of character. ${url}`;
  const groups = [...new Set(quiz.questions.map(q => q.experienceCategory![locale]))];
  function edit() { setResult(false); setReview(false); setPreview(null); setStatus(""); requestAnimationFrame(() => checklist.current?.focus()); }
  function clear() { setSelected([]); setResult(false); setReview(false); setClearing(false); setPreview(null); setStatus(zh ? displayText("全部选择已清空，当前勾选0项。") : "All selections cleared. Zero items checked."); }
  async function copy() {
    try { await navigator.clipboard.writeText(text); setStatus(zh ? displayText("分数与公开入口已复制，不含逐题选择。") : "Score and public entry copied, without item selections."); setManual(false); }
    catch { setManual(true); setStatus(zh ? displayText("无法自动复制，请选择下方文字手动复制。") : "Automatic copy is unavailable. Select the text below to copy it."); }
  }
  async function imageBlob() {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 800;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
    await document.fonts.ready;
    ctx.fillStyle = "#f5f1e8"; ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = "#0c3d39"; ctx.fillRect(0, 0, 1200, 18);
    ctx.strokeStyle = "#dedbce"; ctx.lineWidth = 1;
    for (let y = 140; y < 750; y += 42) { ctx.beginPath(); ctx.moveTo(65, y); ctx.lineTo(1135, y); ctx.stroke(); }
    ctx.fillStyle = "#0c3d39"; ctx.font = "700 28px sans-serif"; ctx.fillText("FERMATMIND / EXPERIENCE 100", 70, 85);
    ctx.font = "700 44px sans-serif"; ctx.fillText(zh ? displayText("Rice Purity · 独立经历清单") : "Rice Purity · Independent edition", 70, 177);
    ctx.font = "700 200px sans-serif"; ctx.fillText(String(score!.score), 65, 406);
    ctx.font = "400 45px sans-serif"; ctx.fillText("/ 100", 430, 400);
    ctx.font = "700 35px sans-serif"; ctx.fillText(zh ? displayText(`100 − ${score!.checked}项勾选 = ${score!.score}`) : `100 − ${score!.checked} checked = ${score!.score}`, 72, 487);
    ctx.font = "400 25px sans-serif";
    const lines = zh ? ["FM Experience 100 v1 · 非经典原版，分数不可跨版本直接比较。", "未勾选可表示未经历或跳过；分数不判断道德、健康或个人价值。", "自愿分享 · 不含逐题选择或分类统计"] : ["FM Experience 100 v1 · Not the classic original; editions are not comparable.", "Unchecked can mean skipped. No judgment of morality, health or worth.", "Sharing is optional · No item selections or category totals"];
    lines.forEach((line, i) => ctx.fillText(zh ? displayText(line) : line, 72, 568 + i * 41));
    ctx.font = "700 23px sans-serif"; ctx.fillText(url.replace("https://", ""), 72, 735);
    return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG unavailable")), "image/png"));
  }
  async function card(share = false) {
    setBusy(true); setStatus("");
    try {
      const blob = await imageBlob(); const file = new File([blob], "rice-purity-fm-experience100-v1.png", { type: "image/png" });
      if (share) {
        if (!navigator.share || !navigator.canShare?.({ files: [file] })) { setStatus(zh ? displayText("当前设备不支持图片分享，可以保存PNG或复制文字。") : "Image sharing is unsupported here. Save the PNG or copy the text."); return; }
        await navigator.share({ files: [file], title: "FM Experience 100 v1", text });
        setStatus(zh ? displayText("已交给系统分享。") : "Handed to system sharing."); return;
      }
      const next = URL.createObjectURL(blob); setPreview(next);
      const a = document.createElement("a"); a.href = next; a.download = file.name; a.click();
      setStatus(zh ? displayText("PNG已生成并开始保存；也可长按下方预览保存。") : "PNG generated and download started. You can also save the preview below.");
    } catch (error) { setStatus(error instanceof Error && error.name === "AbortError" ? (zh ? displayText("已取消分享。") : "Sharing canceled.") : (zh ? displayText("操作未成功，请重试或复制文字。") : "The action failed. Retry or copy the text.")); }
    finally { setBusy(false); }
  }
  return <section id="take-test" className={styles.root} data-stage={result ? "result" : "answer"}>
    {!adult ? <div className={styles.gate}>
      <p className={styles.eyebrow}>FM EXPERIENCE 100 · v1</p><h2>{zh ? displayText("开始前，先确认自己的界限") : "Before you begin, choose your boundaries"}</h2>
      <p>{quiz.instructions![locale]}</p><p>{quiz.introduction[locale]}</p>
      <p>{zh ? displayText("答案只在本页内存中计算；不保存草稿，刷新或关闭即清除。无需提供姓名、生日或账户。") : "Answers are calculated in this page’s memory. No draft is saved; reload or close to clear. No name, birthday or account is required."}</p>
      <button type="button" className={styles.primary} onClick={() => setAdult(true)}>{zh ? displayText("我已成年，自愿继续") : "I am an adult and choose to continue"}</button>
      <Link href={landing}>{zh ? displayText("离开清单，返回介绍") : "Leave and return to the introduction"}</Link>
    </div> : <>
      <div className={styles.meter} aria-label={zh ? displayText("本轮选择") : "This round’s selections"}>
        <div><strong>{score.checked}</strong><span>{zh ? displayText("项已勾选 / 100") : "checked / 100"}</span></div><p>{zh ? displayText("勾选数不是完成率；任何项目都可跳过。") : "Checked count is not completion. Skip any item."}</p>
        <button type="button" onClick={() => setClearing(true)}>{zh ? displayText("清空全部") : "Clear all"}</button>
      </div>
      {!result ? <div ref={checklist} tabIndex={-1}>
        <h2>{zh ? displayText("100项经历清单") : "100-item experience checklist"}</h2>
        <p>{zh ? displayText("只勾选愿意记录的经历；留空可以是未经历或不想回答。") : "Check only experiences you choose to record. Unchecked may mean not experienced or prefer not to answer."}</p>
        <nav className={styles.groups} aria-label={zh ? displayText("跳到经历分组") : "Jump to experience group"}>{groups.map((g, i) => <a key={g} href={`#rice-group-${i}`}>{g}</a>)}</nav>
        <button type="button" className={styles.review} aria-pressed={review} onClick={() => setReview(v => !v)}>{review ? (zh ? displayText("显示全部100项") : "Show all 100 items") : (zh ? displayText("只看已勾选项") : "Review checked items")}</button>
        {review && !selected.length && <p role="status">{zh ? displayText("还没有勾选项目。可以显示全部，或直接查看100分。") : "Nothing checked. Show all items or view the score of 100."}</p>}
        {groups.map((g, gi) => <fieldset key={g} id={`rice-group-${gi}`} className={styles.group}><legend>{g}</legend>{quiz.questions.map((q, i) => q.experienceCategory![locale] !== g || (review && !selected.includes(q.id)) ? null : <label key={q.id} className={styles.item}>
          <input type="checkbox" checked={selected.includes(q.id)} onChange={e => { const checked = e.target.checked; setSelected(old => checked ? [...old, q.id] : old.filter(id => id !== q.id)); setPreview(null); }} /><span className={styles.number}>{i + 1}.</span><span>{q.prompt[locale]}</span>
        </label>)}</fieldset>)}
        <div className={styles.actions}><button type="button" className={styles.primary} onClick={() => { setResult(true); setManual(false); setStatus(""); requestAnimationFrame(() => report.current?.focus()); }}>{zh ? displayText("按当前勾选计算结果") : "Calculate from current selections"}</button><p>{zh ? displayText("查看结果即表示你理解：留空也可能是跳过，本版分数不可直接与其他版本比较。") : "By viewing the result, you acknowledge that unchecked items may be skipped and this edition is not directly comparable with other editions."}</p></div>
      </div> : <div ref={report} tabIndex={-1} className={styles.result}>
        <p className={styles.eyebrow}>FM EXPERIENCE 100 · v1</p><h2>{zh ? displayText("你的本轮Rice Purity分数") : "Your Rice Purity score this round"}</h2>
        <p className={styles.score}>{score.score}<span>/100</span></p><p className={styles.formula}>100 − {score.checked} {zh ? displayText("项勾选") : "checked"} = {score.score}</p>
        <p>{zh ? displayText("这只是本版100项中你主动勾选的计数。未勾选包括未经历或跳过，不代表完整经历；分数不评价道德、健康或个人价值。") : "This counts only what you chose to check in this edition’s 100 items. Unchecked includes not experienced or skipped, so it cannot describe your full history. The score does not judge morality, health or worth."}</p>
        <p>{quiz.introduction[locale]}</p>
        <div className={styles.actions}><button type="button" onClick={edit}>{zh ? displayText("返回修改") : "Edit selections"}</button><button type="button" onClick={() => setClearing(true)}>{zh ? displayText("清空并重测") : "Clear and retake"}</button><button type="button" disabled={busy} onClick={() => void card()}>{zh ? displayText("保存结果PNG") : "Save result PNG"}</button><button type="button" disabled={busy} onClick={() => void card(true)}>{zh ? displayText("系统分享图片") : "Share image"}</button><button type="button" onClick={() => void copy()}>{zh ? displayText("复制分数与入口") : "Copy score and entry"}</button></div>
        <p className={styles.note}>{zh ? displayText("分享完全自愿。图片和文字只含分数、勾选数、版本与公开入口，不含逐题答案。") : "Sharing is optional. Cards and text contain only the score, checked count, edition and public entry, without item answers."}</p>
        {manual && <textarea readOnly aria-label={zh ? displayText("手动复制分享文字") : "Share text to copy manually"} value={text} onFocus={e => e.target.select()} rows={4} />}
        {preview && <div className={styles.preview}><Image unoptimized src={preview} width={1200} height={800} alt={zh ? displayText("本轮分数结果卡，不含逐题选择") : "This round’s score card without item selections"} /></div>}
        <Link target="_blank" rel="noopener noreferrer" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, "score-reading")}>{zh ? displayText("阅读完整分数指南（新标签页）") : "Read the full score guide (new tab)"}</Link>
      </div>}
      <p role="status" aria-live="polite">{busy ? (zh ? displayText("正在生成图片…") : "Preparing image…") : status}</p>
      {clearing && <dialog ref={dialog} onCancel={() => setClearing(false)} aria-labelledby="rice-clear-title" className={styles.confirm}><h3 id="rice-clear-title">{zh ? displayText("清空本轮全部选择？") : "Clear all selections this round?"}</h3><p>{zh ? displayText("确认后无法恢复。取消会保留所有选择。") : "This cannot be undone. Cancel to keep all selections."}</p><button type="button" onClick={() => setClearing(false)} autoFocus>{zh ? displayText("取消，保留选择") : "Cancel, keep selections"}</button><button type="button" onClick={clear}>{zh ? displayText("确认清空") : "Confirm clear"}</button></dialog>}
    </>}
  </section>;
}
