"use client";

import { useState } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";

const labels = {
  en: { copy: "Copy public guide link", copied: "Guide link copied.", manual: "Select and copy the guide link below.", link: "Public guide link" },
  zh: { copy: "复制公开指南链接", copied: "已复制指南链接。", manual: "请选中并复制下方的指南链接。", link: "公开指南链接" },
  "zh-TW": { copy: "複製公開指南連結", copied: "已複製指南連結。", manual: "請選取並複製下方的指南連結。", link: "公開指南連結" },
};

export function PublicGuideShare({ url, locale }: { url: string; locale: DisplayLocale }) {
  const [status, setStatus] = useState<"copied" | "manual">();
  const label = labels[locale];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  }

  return <div className="my-4 space-y-2" data-public-guide-share>
    <button type="button" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 font-semibold" onClick={copy}>{label.copy}</button>
    <p role="status" className="text-sm">{status ? label[status] : ""}</p>
    {status === "manual" && <input aria-label={label.link} className="w-full rounded border border-slate-300 p-2" value={url} readOnly onFocus={(event) => event.currentTarget.select()} />}
  </div>;
}
