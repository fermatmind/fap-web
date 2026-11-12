"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";

const SiteFooterQrPanel = dynamic(() => import("@/components/layout/SiteFooterQrPanel"));
const subscribeReady = () => () => {};

export function SiteFooterSocialRail({ locale }: { locale: DisplayLocale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [activeSocialKey, setActiveSocialKey] = useState<string | null>(null);

  return (
    <div className="fm-social-rail">
      <div className="fm-social-list fm-social-list--brand">
        {FOOTER_SOCIAL_ITEMS.map((item) => {
          const label = locale === "zh-TW" && item.labels.zh === "小红书" ? "小紅書" : item.labels[locale === "en" ? "en" : "zh"];
          return (
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
                  disabled={!ready}
                  title={label}
                  aria-label={label}
                  aria-expanded={activeSocialKey === item.key}
                  className="fm-social-badge fm-social-badge--footer cursor-pointer border-0 bg-transparent p-0"
                  onClick={() => setActiveSocialKey(item.key)}
                  onFocus={() => setActiveSocialKey(item.key)}
                  onBlur={() => setActiveSocialKey((current) => (current === item.key ? null : current))}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="fm-social-logo">
                    <path d={item.icon.path} />
                  </svg>
                  <span className="fm-social-tooltip">{label}</span>
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
                title={label}
                aria-label={label}
                className="fm-social-badge fm-social-badge--footer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="fm-social-logo">
                  <path d={item.icon.path} />
                </svg>
                <span className="fm-social-tooltip">{label}</span>
              </a>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
