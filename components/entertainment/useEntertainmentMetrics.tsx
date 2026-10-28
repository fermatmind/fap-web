"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { recordEntertainmentActivity, type ActivityAction, type ShareMethod } from "@/lib/entertainment/activity";

const subscribeReady = () => () => {};

export function useEntertainmentMetrics(slug: string, version: string, locale: "en" | "zh", privateActivity = false) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const scope = `${slug}:${version}:${locale}`;
  const [permission, setPermission] = useState({ scope: "", accepted: false });
  const permissionRef = useRef(permission);
  const optIn = permission.scope === scope && permission.accepted;
  const changePermission = useCallback((accepted: boolean) => {
    const next = { scope, accepted };
    permissionRef.current = next;
    setPermission(next);
  }, [scope]);
  useEffect(() => {
    const clear = () => changePermission(false);
    window.addEventListener("pagehide", clear);
    return () => { window.removeEventListener("pagehide", clear); permissionRef.current = { scope: "", accepted: false }; };
  }, [changePermission]);
  const send = useCallback((action: ActivityAction, method?: ShareMethod) => {
    const permitted = permissionRef.current.scope === scope && permissionRef.current.accepted;
    recordEntertainmentActivity(slug, version, locale, action, "single", method, permitted);
  }, [slug, version, locale, scope]);
  const metrics = useMemo(() => ({
    start: () => send("start"), complete: () => send("complete"), view: () => send("result_view"),
    share: (method: ShareMethod = "copy") => send("share", method),
  }), [send]);
  const consent = privateActivity ? <label data-entertainment-activity-opt-in className="my-4 block rounded-lg border border-slate-200 p-3 text-sm leading-6">
    <input type="checkbox" disabled={!ready} checked={optIn} onChange={event => changePermission(event.target.checked)} className="mr-2" />
    {locale === "zh" ? "可选：允许本页匿名次数统计（默认关闭）" : "Optional: allow anonymous activity counts on this page (off by default)"}
    <span className="block text-slate-600">{locale === "zh" ? "另遵循你的全站分析选择。只计开始、完成、结果查看和分享动作，不发送输入、答案、结果内容或身份；不回补开启前的动作。离开本页即失效。" : "Also respects your site analytics choice. Counts only starts, completions, result views and share actions. No inputs, answers, result content or identity; earlier actions are not backfilled. Permission ends when you leave this page."}</span>
  </label> : null;
  return { ...metrics, consent };
}

export function useEntertainmentResultView(view: () => void, visible: boolean) {
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) view();
    wasVisible.current = visible;
  }, [visible, view]);
}
