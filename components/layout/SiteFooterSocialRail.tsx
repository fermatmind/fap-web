"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";

const SiteFooterQrPanel = dynamic(() => import("@/components/layout/SiteFooterQrPanel"));

export function SiteFooterSocialRail({ locale }: { locale: Locale }) {
  const [activeSocialKey, setActiveSocialKey] = useState<string | null>(null);

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

                {item.qrImageSrc && activeSocialKey === item.key ? (
                  <SiteFooterQrPanel
                    imageSrc={item.qrImageSrc}
                    fallbackSrc={item.qrFallbackSrc}
                    locale={locale}
                  />
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
