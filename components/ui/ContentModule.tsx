"use client";

import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";

class ModuleBoundary extends Component<{ children: ReactNode; locale: DisplayLocale; retry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    const zh = this.props.locale === "zh";
    const taiwan = this.props.locale === "zh-TW";
    return <div role="alert" className="my-4 space-y-3 rounded-lg border border-amber-200 p-4">
      <p>{taiwan ? "內容載入失敗。你輸入的資料仍保留，可以重試，或使用本頁的返回或清除功能。" : zh ? "本次内容加载失败。你的当前输入仍保留，可以重试；也可以使用本页的返回或清除操作。" : "This content could not load. Your current inputs are retained. Retry, or use this page’s return or clear controls."}</p>
      <button type="button" className="min-h-12 rounded-lg border px-4 py-3 underline" onClick={this.props.retry}>{taiwan ? "重新載入" : zh ? "重试加载" : "Retry loading"}</button>
    </div>;
  }
}

function Loading({ locale, retry }: { locale: DisplayLocale; retry: () => void }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setSlow(true), 12_000); return () => clearTimeout(timer); }, []);
  const zh = locale === "zh";
  const taiwan = locale === "zh-TW";
  return <div role="status" className="my-4 space-y-3">
    <p>{slow ? (taiwan ? "載入時間比預期長。你可以重試，或使用本頁的返回功能。" : zh ? "加载比预期慢。你可以重试，或使用本页的返回操作。" : "Loading is taking longer than expected. Retry, or use this page’s return controls.") : (taiwan ? "正在準備內容……" : zh ? "正在准备内容……" : "Preparing content…")}</p>
    {slow && <button type="button" className="min-h-12 rounded-lg border px-4 py-3 underline" onClick={retry}>{taiwan ? "重新載入" : zh ? "重试加载" : "Retry loading"}</button>}
  </div>;
}

/** A retry creates a fresh lazy instance; rejected promises must not trap the UI.
 * The boundary surrounds only the module, leaving the caller's answers intact. */
export function contentModule<Props extends { locale: DisplayLocale }>(load: () => Promise<{ default: (props: Props) => ReactNode }>) {
  return function QuestionnaireModule(props: Props) {
    const [{ Loaded, attempt }, setModule] = useState(() => ({ Loaded: lazy(load), attempt: 0 }));
    const retry = () => setModule(previous => ({ Loaded: lazy(load), attempt: previous.attempt + 1 }));
    return <ModuleBoundary key={attempt} locale={props.locale} retry={retry}>
      <Suspense fallback={<Loading locale={props.locale} retry={retry} />}><Loaded {...props} /></Suspense>
    </ModuleBoundary>;
  };
}
