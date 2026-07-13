"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";

export function PublicContentLoading() {
  const locale = useLocale();
  const label = locale === "zh" ? "正在加载页面内容" : "Loading page content";

  return (
    <Container as="main" className="min-h-[52vh] py-[var(--fm-section-y)]">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={label}
        data-public-content-loading="true"
        className="mx-auto max-w-3xl rounded-[var(--fm-radius-xl)] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-[var(--fm-pad-card-x)] shadow-[var(--fm-shadow-sm)]"
      >
        <div aria-hidden="true" className="space-y-[var(--fm-gap-md)]">
          <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--fm-surface-muted)]" />
          <div className="h-10 w-3/4 animate-pulse rounded-lg bg-[var(--fm-surface-muted)]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[var(--fm-surface-muted)]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[var(--fm-surface-muted)]" />
        </div>
        <span className="sr-only">{label}</span>
      </div>
    </Container>
  );
}
