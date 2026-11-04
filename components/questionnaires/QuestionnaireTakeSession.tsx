"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireTakeContext } from "./QuestionnaireTakeContext";
import takeStyles from "@/components/quiz/AssessmentTake.module.css";
import styles from "./QuestionnaireTake.module.css";

/** Invoke each mounted engine's real start handler once, after hydration. */
export function QuestionnaireTakeSession({ children, title, minutes, locale, landing, autoStart = true }: { children: ReactNode; title: string; minutes: number; locale: Locale; landing: string; autoStart?: boolean }) {
  const region = useRef<HTMLDivElement>(null), entered = useRef(false);
  const [preparing, setPreparing] = useState(autoStart), [slow, setSlow] = useState(false);
  const zh = locale === "zh";
  useEffect(() => {
    const root = region.current;
    if (!root) return;
    if (!autoStart) {
      const url = new URL(window.location.href);
      url.searchParams.delete("start");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      return;
    }
    function enter() {
      if (entered.current || !root) return;
      const engine = root.querySelector<HTMLElement>('[data-stage="answer"], [data-stage="result"], [data-jung56-progress]');
      if (engine) { entered.current = true; setPreparing(false); return; }
      if (root.querySelector("[data-take-version-selector]")) { entered.current = true; setPreparing(false); return; }
      const start = root.querySelector<HTMLButtonElement>("button[data-explore-start]:not(:disabled)");
      if (!start) return;
      const url = new URL(window.location.href);
      const resume = root.querySelector<HTMLButtonElement>("button[data-questionnaire-resume]:not(:disabled)");
      // A reload keeps an optional saved draft available for an explicit choice.
      if (resume && url.searchParams.get("start") !== "1") { entered.current = true; setPreparing(false); return; }
      entered.current = true;
      start.click();
      url.searchParams.delete("start");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      setPreparing(false);
    }
    enter();
    const observer = new MutationObserver(enter);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "data-stage"] });
    const timer = window.setTimeout(() => setSlow(true), 12000);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [autoStart]);
  return <QuestionnaireTakeContext.Provider value>
    <main className={styles.main}>
      <div className={`${takeStyles.layout} ${styles.surface}`} data-questionnaire-take>
        <header className={takeStyles.headerRow}>
          <h1 className={takeStyles.testName}>{title}</h1>
          {minutes > 0 && <p className={takeStyles.time}>{zh ? `预计用时 ${minutes} 分钟` : `About ${minutes} minutes`}</p>}
        </header>
        {preparing && <div role="status" className={styles.preparing}>{slow ? (zh ? "准备时间较长，可以刷新重试或返回介绍页。" : "Preparation is taking longer. Reload to retry or return to the introduction.") : (zh ? "正在准备题目…" : "Preparing your questions…")}
          {slow && <div className="mt-4 flex flex-wrap gap-4"><button type="button" onClick={() => window.location.reload()}>{zh ? "刷新重试" : "Reload and retry"}</button><Link prefetch={false} href={landing}>{zh ? "返回测评介绍" : "Back to introduction"}</Link></div>}
        </div>}
        <div ref={region} className={styles.engine} data-preparing={preparing ? "true" : undefined}>{children}</div>
        <noscript><p>{zh ? "答题需要JavaScript，请启用后刷新。" : "Enable JavaScript and reload to answer."} <Link href={landing}>{zh ? "返回测评介绍" : "Back to introduction"}</Link></p></noscript>
      </div>
    </main>
  </QuestionnaireTakeContext.Provider>;
}
