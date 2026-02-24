import { LockedInsightTeaser, type LockedInsightIntent } from "@/components/report/LockedInsightTeaser";

export function LockedBlock({
  title,
  ctaLabel,
  description,
  locale = "en",
  intent = "personality",
}: {
  title: string;
  ctaLabel?: string;
  description?: string;
  locale?: "en" | "zh";
  intent?: LockedInsightIntent;
}) {
  return (
    <LockedInsightTeaser
      title={title}
      ctaLabel={ctaLabel}
      description={description}
      locale={locale}
      intent={intent}
    />
  );
}
