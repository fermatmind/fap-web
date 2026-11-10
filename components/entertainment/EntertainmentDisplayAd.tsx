"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type ReactNode } from "react";

const publisher = "ca-pub-4177231401395141";
const slot = "4432048993";
const answerStage = '[data-stage="answer"], [data-stage="intro"], [data-stage="interlude"]';

export function EntertainmentDisplayAd({ children, label, nonce, take, consentPreview }: {
  children: ReactNode;
  label: string;
  nonce: string;
  take: boolean;
  consentPreview: boolean;
}) {
  const region = useRef<HTMLDivElement>(null);
  const ad = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const closed = useRef(false);
  const [show, setShow] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    const content = region.current;
    if (!content) return;
    const contentRegion = content;
    function update() {
      const answering = Boolean(contentRegion.querySelector(answerStage))
        && !contentRegion.querySelector('[data-stage="result"]');
      const eligible = !window.location.hash && (!take || consentPreview || answering);
      if (!eligible && requested.current) closed.current = true;
      setShow(eligible && !closed.current);
    }
    update();
    const observer = new MutationObserver(update);
    if (take && !consentPreview) {
      observer.observe(content, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-stage"] });
    }
    window.addEventListener("hashchange", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", update);
    };
  }, [take, consentPreview]);

  function requestAd() {
    if (!ad.current || requested.current) return;
    requested.current = true;
    const browser = window as Window & { adsbygoogle?: Record<string, never>[] };
    (browser.adsbygoogle ??= []).push({});
  }

  const showUnit = show && !scriptFailed && !consentPreview;
  return (
    <>
      <div ref={region} className="contents">{children}</div>
      {showUnit && (
        <aside
          aria-label={label}
          className="mx-auto mt-16 mb-8 w-[calc(100%-2rem)] max-w-3xl min-w-0 text-center has-[>ins[data-ad-status=unfilled]]:hidden"
        >
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
      {show && !scriptFailed && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
          nonce={nonce}
          onReady={requestAd}
          onError={() => setScriptFailed(true)}
        />
      )}
    </>
  );
}
