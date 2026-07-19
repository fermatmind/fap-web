import type { Locale } from "@/lib/i18n/locales";
import { isHumanReviewCompleted, type PublicReview } from "@/lib/public-content/publicReview";

function formatReviewDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function PublicReviewStatus({
  review,
  locale,
  testId,
}: {
  review: PublicReview | null | undefined;
  locale: Locale;
  testId?: string;
}) {
  if (!isHumanReviewCompleted(review)) {
    return null;
  }

  return (
    <span data-testid={testId}>
      {locale === "zh" ? "人工审核完成" : "Human review completed"}
      {review?.lastReviewedAt ? ` · ${formatReviewDate(review.lastReviewedAt, locale)}` : null}
    </span>
  );
}
