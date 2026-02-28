"use client";

import Link from "next/link";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeNegotiation";
import type { Locale } from "@/lib/i18n/locales";

type LocaleGatewayButtonsProps = {
  preferred: Locale;
};

function persistLocalePreference(locale: Locale) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}

export function LocaleGatewayButtons({ preferred }: LocaleGatewayButtonsProps) {
  const preferredClass =
    "border-[var(--fm-cta-orange)] bg-[var(--fm-cta-orange)] text-white hover:bg-[var(--fm-cta-orange-strong)]";
  const regularClass =
    "border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-trust-blue)] hover:border-[var(--fm-trust-blue)]";

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Link
        href="/zh"
        data-preferred={preferred === "zh" ? "1" : "0"}
        onClick={() => persistLocalePreference("zh")}
        className={`inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-semibold transition ${preferred === "zh" ? preferredClass : regularClass}`}
      >
        Continue in 中文
      </Link>
      <Link
        href="/en"
        data-preferred={preferred === "en" ? "1" : "0"}
        onClick={() => persistLocalePreference("en")}
        className={`inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-semibold transition ${preferred === "en" ? preferredClass : regularClass}`}
      >
        Continue in English
      </Link>
    </div>
  );
}
