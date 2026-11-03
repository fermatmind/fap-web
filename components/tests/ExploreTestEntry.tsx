"use client";

import { useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";

const subscribeReady = () => () => {};

/** One user action invokes the mounted engine's own start handler. */
export function ExploreTestEntry({ locale, tool }: { locale: Locale; tool: boolean }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [message, setMessage] = useState("");
  function enter() {
    const engine = document.getElementById("take-test");
    if (!engine) {
      setMessage(locale === "zh" ? "测试暂不可用，请刷新后重试。" : "The test is unavailable. Reload and try again.");
      return;
    }
    if (tool) {
      engine.scrollIntoView({ block: "start", behavior: "smooth" });
      engine.querySelector<HTMLElement>("input:not(:disabled), select:not(:disabled), button:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    const start = engine.querySelector<HTMLButtonElement>("button[data-explore-start]");
    if (!start || start.matches(":disabled")) {
      setMessage(locale === "zh" ? "测试尚未准备完成，请稍后重试。" : "The test is not ready yet. Please try again shortly.");
      return;
    }
    setMessage("");
    start.click();
    engine.scrollIntoView({ block: "start" });
  }
  return <>
    <button type="button" className="explore-intro-entry" disabled={!ready} onClick={enter}>
      {locale === "zh" ? (tool ? "打开工具" : "开始测试") : (tool ? "Open tool" : "Start test")}
      <span aria-hidden="true">→</span>
    </button>
    {message && <p role="status">{message}</p>}
  </>;
}
