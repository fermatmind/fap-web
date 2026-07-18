"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/observability/sentry";

export type PublicContentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  surface: string;
  retryAction?: () => void;
};

export function PublicContentError({ error, reset, retryAction, surface }: PublicContentErrorProps) {
  const locale = useLocale();
  const retryStartedRef = useRef(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    captureError(error, {
      route: "public-content-boundary",
      surface,
      digest: error.digest,
      stage: "public_content_render",
    });
  }, [error, surface]);

  const copy = locale === "zh"
    ? {
        title: "暂时无法加载此页面",
        body: "内容服务暂时没有完成响应。你可以重试当前页面。",
        retry: "重试",
        retrying: "正在重试…",
      }
    : {
        title: "This page is temporarily unavailable",
        body: "The content service did not complete this request. You can retry this page.",
        retry: "Retry",
        retrying: "Retrying…",
      };

  const retry = () => {
    if (retryStartedRef.current) return;

    retryStartedRef.current = true;
    setIsRetrying(true);
    (retryAction ?? reset)();
  };

  return (
    <Container as="main" className="min-h-[52vh] py-[var(--fm-section-y)]">
      <div
        role="alert"
        data-public-content-error={surface}
        className="mx-auto max-w-2xl rounded-[var(--fm-radius-xl)] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-[var(--fm-pad-card-x)] shadow-[var(--fm-shadow-sm)]"
      >
        <h1 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">{copy.title}</h1>
        <p className="mb-[var(--fm-gap-lg)] mt-[var(--fm-gap-sm)] text-sm leading-6 text-[var(--fm-text-muted)]">
          {copy.body}
        </p>
        <Button type="button" onClick={retry} disabled={isRetrying} aria-busy={isRetrying}>
          {isRetrying ? copy.retrying : copy.retry}
        </Button>
      </div>
    </Container>
  );
}
