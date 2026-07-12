"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";
import { cn } from "@/lib/utils";

export function SiteFooterSocialRail({ locale }: { locale: Locale }) {
  const [activeSocialKey, setActiveSocialKey] = useState<string | null>(null);
  const [qrFallbackState, setQrFallbackState] = useState<Record<string, boolean>>({});

  return (
    <div className="fm-social-rail border-t border-slate-300/70 pt-8">
      <div className="fm-social-list">
        {FOOTER_SOCIAL_ITEMS.map((item) => (
          <div
            key={item.key}
            className="fm-social-item"
            onMouseEnter={() => setActiveSocialKey(item.key)}
            onMouseLeave={() => setActiveSocialKey((current) => (current === item.key ? null : current))}
          >
            {item.kind === "qr" ? (
              <>
                <button
                  type="button"
                  title={locale === "zh" ? item.labels.zh : item.labels.en}
                  aria-label={locale === "zh" ? item.labels.zh : item.labels.en}
                  aria-expanded={activeSocialKey === item.key}
                  className="fm-social-badge fm-social-badge--footer cursor-pointer border-0 bg-transparent p-0"
                  onClick={() => setActiveSocialKey(item.key)}
                  onFocus={() => setActiveSocialKey(item.key)}
                  onBlur={() => setActiveSocialKey((current) => (current === item.key ? null : current))}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="fm-social-logo">
                    <path d={item.icon.path} />
                  </svg>
                  <span className="fm-social-tooltip">{locale === "zh" ? item.labels.zh : item.labels.en}</span>
                </button>

                {item.qrImageSrc ? (
                  <div
                    className={cn("fm-social-qr-panel", activeSocialKey === item.key && "is-open")}
                    aria-hidden={activeSocialKey === item.key ? "false" : "true"}
                  >
                    <Image
                      src={qrFallbackState[item.key] && item.qrFallbackSrc ? item.qrFallbackSrc : item.qrImageSrc}
                      alt={locale === "zh" ? "微信二维码" : "WeChat QR code"}
                      width={258}
                      height={258}
                      unoptimized
                      priority
                      className="fm-social-qr-image"
                      onError={() => {
                        if (!item.qrFallbackSrc || qrFallbackState[item.key]) return;
                        setQrFallbackState((current) => ({ ...current, [item.key]: true }));
                      }}
                    />
                    <p className="fm-social-qr-label">{locale === "zh" ? "微信扫码关注" : "Scan in WeChat"}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={locale === "zh" ? item.labels.zh : item.labels.en}
                aria-label={locale === "zh" ? item.labels.zh : item.labels.en}
                className="fm-social-badge fm-social-badge--footer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="fm-social-logo">
                  <path d={item.icon.path} />
                </svg>
                <span className="fm-social-tooltip">{locale === "zh" ? item.labels.zh : item.labels.en}</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
