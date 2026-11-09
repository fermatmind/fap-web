"use client";

import Script from "next/script";
import { useRef } from "react";

const publisher = "ca-pub-4177231401395141";
const slot = "4432048993";

export function GlobalHistoryDisplayAd({
  label,
  nonce,
  showUnit,
}: {
  label: string;
  nonce: string;
  showUnit: boolean;
}) {
  const ad = useRef<HTMLModElement>(null);
  const requested = useRef(false);

  function requestAd() {
    if (!ad.current || requested.current) return;
    requested.current = true;
    const browser = window as Window & { adsbygoogle?: Record<string, never>[] };
    (browser.adsbygoogle ??= []).push({});
  }

  return (
    <>
      {showUnit && (
        <aside aria-label={label} className="mx-auto mt-10 w-full min-w-0 text-center">
          <p className="mb-2 text-xs text-slate-500">{label}</p>
          <ins
            ref={ad}
            className="adsbygoogle block min-h-[90px]"
            data-ad-client={publisher}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </aside>
      )}
      <Script
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
        strategy="lazyOnload"
        crossOrigin="anonymous"
        nonce={nonce}
        onReady={requestAd}
      />
    </>
  );
}
