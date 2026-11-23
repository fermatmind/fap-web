"use client";

import Script from "next/script";

export function EntertainmentDisplayAd({ nonce }: { nonce: string }) {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4177231401395141"
      strategy="lazyOnload"
      crossOrigin="anonymous"
      nonce={nonce}
    />
  );
}
