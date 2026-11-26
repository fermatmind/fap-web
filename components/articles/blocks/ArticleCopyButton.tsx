"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { articleEditorialCopy } from "../articleEditorialCopy";

export function ArticleCopyButton({ label, value, locale, tracking }: {
  label: string;
  value: string;
  locale: DisplayLocale;
  tracking?: { name: string; slug: string; blockIndex?: number };
}) {
  const [state, setState] = useState<"ready" | "copied" | "failed">("ready");
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copy = articleEditorialCopy[locale];
  useEffect(() => () => clearTimeout(reset.current), []);

  async function onClick() {
    clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setState("failed");
      return;
    }
    setState("copied");
    reset.current = setTimeout(() => setState("ready"), 2000);
    if (tracking) trackEvent(tracking.name, { article_slug: tracking.slug, locale, block_index: tracking.blockIndex });
  }

  return <div className="fm-article-copy">
    <button type="button" onClick={onClick}>{label}</button>
    <span role="status">{state === "copied" ? copy.copied : state === "failed" ? copy.failed : null}</span>
    {state === "failed" ? <textarea readOnly aria-label={label} value={value} onFocus={(event) => event.currentTarget.select()} /> : null}
  </div>;
}
