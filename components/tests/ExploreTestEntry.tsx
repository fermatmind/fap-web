"use client";

import { useState, useSyncExternalStore } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";

const subscribeReady = () => () => {};

const entryCopy = {
  en: {
    tool: "Open tool",
    test: "Start test",
    unavailable: "The test is unavailable. Reload and try again.",
    notReady: "The test is not ready yet. Please try again shortly.",
  },
  zh: {
    tool: "打开工具",
    test: "开始测试",
    unavailable: "测试暂不可用，请刷新后重试。",
    notReady: "测试尚未准备完成，请稍后重试。",
  },
  "zh-TW": {
    tool: "開啟工具",
    test: "開始測驗",
    unavailable: "測驗暫時無法使用，請重新整理後再試。",
    notReady: "測驗尚未準備完成，請稍後再試。",
  },
} satisfies Record<DisplayLocale, Record<string, string>>;

/** One user action invokes the mounted engine's own start handler. */
export function ExploreTestEntry({ locale, tool }: { locale: DisplayLocale; tool: boolean }) {
  const copy = entryCopy[locale];
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [message, setMessage] = useState("");
  function enter() {
    const engine = document.getElementById("take-test");
    if (!engine) {
      setMessage(copy.unavailable);
      return;
    }
    if (tool) {
      engine.scrollIntoView({ block: "start", behavior: "smooth" });
      engine.querySelector<HTMLElement>("input:not(:disabled), select:not(:disabled), button:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    const start = engine.querySelector<HTMLButtonElement>("button[data-explore-start]");
    if (!start || start.matches(":disabled")) {
      setMessage(copy.notReady);
      return;
    }
    setMessage("");
    start.click();
    engine.scrollIntoView({ block: "start" });
  }
  return <>
    <button type="button" className="explore-intro-entry" disabled={!ready} onClick={enter}>
      {tool ? copy.tool : copy.test}
      <span aria-hidden="true">→</span>
    </button>
    {message && <p role="status">{message}</p>}
  </>;
}
