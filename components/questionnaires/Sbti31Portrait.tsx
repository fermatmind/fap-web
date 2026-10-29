"use client";
import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
export function Sbti31Portrait({ code, name, locale }: { code: string; name: string; locale: Locale }) {
  const [failed, setFailed] = useState(false);
  if (!/^[A-Z][A-Z-]{2,6}$/.test(code)) return null;
  return <figure className="my-6" data-sbti31-portrait={code}>{failed
    ? <p className="text-sm leading-7">{locale === "zh" ? "原版插图暂未加载；完整文字与结果仍可阅读。" : "The original illustration did not load; the full text and result remain available."}</p>
    : <Image unoptimized src={`https://api.fermatmind.com/static/weapp/sbti/${encodeURIComponent(code)}.png`} width={92} height={114} alt={locale === "zh" ? `${name}的原版趣味插图` : `Original playful illustration for ${name}`} className="h-auto w-[92px]" onError={() => setFailed(true)} />}</figure>;
}
