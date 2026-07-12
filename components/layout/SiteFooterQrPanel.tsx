"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";

export default function SiteFooterQrPanel({
  imageSrc,
  fallbackSrc,
  locale,
}: {
  imageSrc: string;
  fallbackSrc?: string;
  locale: Locale;
}) {
  const [useFallback, setUseFallback] = useState(false);

  return (
    <div className="fm-social-qr-panel is-open" aria-hidden="false">
      <Image
        src={useFallback && fallbackSrc ? fallbackSrc : imageSrc}
        alt={locale === "zh" ? "微信二维码" : "WeChat QR code"}
        width={258}
        height={258}
        unoptimized
        className="fm-social-qr-image"
        onError={() => {
          if (!fallbackSrc || useFallback) return;
          setUseFallback(true);
        }}
      />
      <p className="fm-social-qr-label">{locale === "zh" ? "微信扫码关注" : "Scan in WeChat"}</p>
    </div>
  );
}
