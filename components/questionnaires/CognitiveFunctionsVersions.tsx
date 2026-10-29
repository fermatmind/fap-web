"use client";
import { lazy, Suspense, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
const Jung56Client = lazy(() => import("./Jung56Client"));
const Original32Client = lazy(() => import("./CognitiveFunctions32Client"));
const readySubscription = () => () => {};
const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
export function CognitiveFunctionsVersions({ locale }: { locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(readySubscription, () => true, () => false);
  const [method, setMethod] = useState<"paired56" | "ratings32" | null>(null);
  const [notice, setNotice] = useState("");
  function clearDraft() { let removed = true; try { sessionStorage.removeItem("fm_questionnaire_draft:cognitive-functions-test"); } catch { removed = false; } window.dispatchEvent(new Event("fm-questionnaire-draft")); return removed; }
  const blockedStorageNotice = zh ? "浏览器拒绝访问32题草稿，无法确认删除该副本；可以关闭标签页删除标签页草稿。当前回答已清除，56题版不会读取旧草稿。" : "The browser blocked access to the 32-rating draft, so deletion of that copy could not be confirmed. Closing the tab removes its tab draft. Current responses were cleared; the 56-choice edition does not read the old draft.";
  function select(next: "paired56" | "ratings32") { const cleared = method !== null || next === "paired56" ? clearDraft() : true; setMethod(next); setNotice(cleared ? "" : blockedStorageNotice); }
  return <section id={method ? "cognitive-method-selector" : "take-test"} data-cognitive-versions className="my-8 scroll-mt-24 space-y-5">
    <h2 className="text-2xl font-semibold">{zh ? "选择一种方法" : "Choose a method"}</h2>
    <p className="leading-8">{zh ? "两版独立作答，不合并数字。56题版比较相对选择次数；32题版分别呈现自评均值。两版均未建立心理测量验证，不给功能栈或MBTI类型。" : "Answer each edition separately; their numbers are not combined. The 56-choice edition compares relative selection counts. The 32-rating edition gives separate self-reported means. Neither has established psychometric validation or produces a function stack or MBTI type."}</p>
    {!method ? <div className="grid gap-4 sm:grid-cols-2"><button type="button" disabled={!ready} className={button} data-cognitive-method="paired56" onClick={() => select("paired56")}><span className="block">{zh ? "选择56题二选一版" : "Choose the 56-choice edition"}</span><span className="mt-2 block text-sm font-normal leading-7">{zh ? "自有小程序公开试用题本；八方向选择次数、全部并列与完整解释。约15分钟，不限时；不保存草稿。" : "Our Mini public-preview bank; eight direction counts, every tie and full explanations. About 15 minutes, untimed; no saved draft."}</span></button><button type="button" disabled={!ready} className={button} data-cognitive-method="ratings32" onClick={() => select("ratings32")}><span className="block">{zh ? "选择32题自评版" : "Choose the 32-rating edition"}</span><span className="mt-2 block text-sm font-normal leading-7">{zh ? "原有独立题本；过去一个月的1至5自评、反向换算与八组均值。约10分钟，不限时；可选标签页草稿。" : "The original independent bank; past-month 1–5 ratings, reverse keys and eight separate means. About 10 minutes, untimed; optional tab draft."}</span></button></div> : <>
      <p data-cognitive-selected-method className="font-semibold">{method === "paired56" ? (zh ? "当前：56题二选一版" : "Selected: 56-choice edition") : (zh ? "当前：32题自评版" : "Selected: 32-rating edition")}</p>
      <button type="button" className={button} onClick={() => { const cleared = clearDraft(); setMethod(null); setNotice(cleared ? (zh ? "已清除本次作答与草稿，请重新选择方法。" : "This attempt and any draft were cleared. Choose a method again.") : blockedStorageNotice); }}>{zh ? "切换方法并清除回答" : "Switch method and clear responses"}</button>
      <Suspense fallback={<p role="status">{zh ? "正在准备所选版本……" : "Preparing your selected edition…"}</p>}>{method === "paired56" ? <Jung56Client locale={locale} /> : <Original32Client locale={locale} />}</Suspense>
    </>}
    <p role="status" className="text-sm leading-7">{notice}</p><noscript><p>{zh ? "作答需要JavaScript；下方公开指南仍可阅读。" : "Answering requires JavaScript; the public guides below remain readable."}</p></noscript>
  </section>;
}
