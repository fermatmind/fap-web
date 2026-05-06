"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api-client";
import { lookupResultsByEmail, type ResultEmailLookupItem } from "@/lib/api/v0_3";
import { normalizeCommerceReportPath } from "@/lib/commerce/redirectUrls";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { captureError } from "@/lib/observability/sentry";
import { cn } from "@/lib/utils";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeLookupEmail(value: string): string {
  return value.trim().toLowerCase();
}

function resolveScaleLabel(item: ResultEmailLookupItem): string {
  return normalizeText(item.scale_code)
    || normalizeText(item.scale_code_legacy)
    || normalizeText(item.scale_code_v2)
    || "Result";
}

function formatDate(locale: Locale, value: string | null | undefined): string {
  const normalized = normalizeText(value);
  if (!normalized) {
    return locale === "zh" ? "时间未返回" : "Time not returned";
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function withLocaleIfNeeded(path: string, locale: Locale): string {
  if (/^\/(?:en|zh)(?:\/|$)/.test(path)) {
    return path;
  }

  return localizedPath(path, locale);
}

function resolveResultHref(item: ResultEmailLookupItem, locale: Locale): string | null {
  const directHref = normalizeCommerceReportPath(item.result_url);
  if (directHref) {
    const params = new URLSearchParams(directHref.split("?")[1] ?? "");
    if (params.has("access_token") || params.has("result_access_token")) {
      return null;
    }

    return withLocaleIfNeeded(directHref, locale);
  }

  return null;
}

export function ResultEmailLookupForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<ResultEmailLookupItem[] | null>(null);
  const [searchedEmail, setSearchedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = useMemo(() => {
    const isZh = locale === "zh";
    return {
      cardTitle: isZh ? "通过邮箱找回结果" : "Find saved results by email",
      cardDescription: isZh
        ? "输入邮箱即可找回该邮箱下保存的结果，请使用你自己的邮箱。"
        : "Enter your email to find saved results for that email. Use your own email address.",
      email: isZh ? "邮箱" : "Email",
      submit: isZh ? "查找结果" : "Find results",
      submitting: isZh ? "正在查找..." : "Finding...",
      noMatches: isZh ? "该邮箱下暂未找到已保存的结果。" : "No saved results were found for that email.",
      matchesPrefix: isZh ? "找到以下已保存结果：" : "Saved results found:",
      openResult: isZh ? "打开结果" : "Open result",
      unavailable: isZh ? "结果链接暂不可用" : "Result link unavailable",
      type: isZh ? "类型" : "Type",
      submittedAt: isZh ? "提交时间" : "Submitted",
      tokenExpiry: isZh ? "访问链接有效期" : "Access link expires",
      validation: isZh ? "请输入邮箱。" : "Enter an email address.",
      genericError: isZh ? "暂时无法查找结果，请稍后再试。" : "Unable to find saved results. Try again later.",
      rateLimited: isZh ? "请求过于频繁，请稍后再试。" : "Too many lookup attempts. Try again later.",
    };
  }, [locale]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeLookupEmail(email);
    if (!normalizedEmail) {
      setError(labels.validation);
      setItems(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setItems(null);
    setSearchedEmail(normalizedEmail);

    try {
      const response = await lookupResultsByEmail({
        email: normalizedEmail,
        locale,
      });
      setItems(Array.isArray(response.items) ? response.items : []);
    } catch (cause) {
      const message =
        cause instanceof ApiError && cause.status === 429
          ? labels.rateLimited
          : labels.genericError;
      setError(message);
      captureError(cause, {
        route: "/results/lookup",
        stage: "lookup_results_by_email",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{labels.cardTitle}</CardTitle>
          <CardDescription>{labels.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" data-testid="result-email-lookup-form" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--fm-text)]">{labels.email}</span>
              <input
                data-testid="result-email-lookup-input"
                type="email"
                value={email}
                autoComplete="email"
                inputMode="email"
                required
                className="h-12 w-full rounded-[8px] border border-[var(--fm-border)] bg-white px-3 text-sm text-[var(--fm-text)] shadow-inner outline-none transition focus:border-[var(--fm-trust-blue)] focus:ring-2 focus:ring-[var(--fm-focus)]"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {error ? <Alert data-testid="result-email-lookup-error">{error}</Alert> : null}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto"
              data-testid="result-email-lookup-submit"
            >
              {submitting ? labels.submitting : labels.submit}
            </Button>
          </form>
        </CardContent>
      </Card>

      {items ? (
        <section className="space-y-3" data-testid="result-email-lookup-results">
          <p className="text-sm text-[var(--fm-text-muted)]">
            {items.length === 0 ? labels.noMatches : labels.matchesPrefix}
          </p>
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => {
                const href = resolveResultHref(item, locale);
                const scaleLabel = resolveScaleLabel(item);
                const typeCode = normalizeText(item.type_code);
                const itemKey = normalizeText(item.attempt_id) || normalizeText(item.result_id) || `${searchedEmail}-${index}`;

                return (
                  <article
                    key={itemKey}
                    className="rounded-[8px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 shadow-[var(--fm-shadow-sm)]"
                    data-testid="result-email-lookup-item"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">{scaleLabel}</h2>
                        <dl className="m-0 grid gap-1 text-sm text-[var(--fm-text-muted)]">
                          {typeCode ? (
                            <div className="flex gap-2">
                              <dt>{labels.type}</dt>
                              <dd className="m-0 font-medium text-[var(--fm-text)]">{typeCode}</dd>
                            </div>
                          ) : null}
                          <div className="flex gap-2">
                            <dt>{labels.submittedAt}</dt>
                            <dd className="m-0">{formatDate(locale, item.submitted_at ?? item.computed_at ?? null)}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt>{labels.tokenExpiry}</dt>
                            <dd className="m-0">{formatDate(locale, item.result_access_token_expires_at ?? null)}</dd>
                          </div>
                        </dl>
                      </div>
                      {href ? (
                        <Link
                          href={href}
                          prefetch={false}
                          className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}
                          data-testid="result-email-lookup-open"
                        >
                          {labels.openResult}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-[var(--fm-text-muted)]">{labels.unavailable}</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
