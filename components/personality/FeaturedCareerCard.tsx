import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MiniStrainRadar } from "@/components/personality/MiniStrainRadar";
import type { CareerPreviewCard } from "@/lib/mbti/personalityHub.types";

function renderStanceLabel(stance: CareerPreviewCard["stance"], locale: "en" | "zh") {
  if (stance === "recommended") {
    return locale === "zh" ? "Recommended" : "Recommended";
  }

  if (stance === "not_recommended") {
    return locale === "zh" ? "Not recommended" : "Not recommended";
  }

  return locale === "zh" ? "Conditional" : "Conditional";
}

function renderStanceClass(stance: CareerPreviewCard["stance"]) {
  if (stance === "recommended") {
    return "border-[var(--fm-hub-decision-green)] bg-[color-mix(in_srgb,var(--fm-hub-decision-green)_12%,white)] text-[var(--fm-hub-decision-green)]";
  }

  if (stance === "not_recommended") {
    return "border-[var(--fm-hub-friction-rose)] bg-[color-mix(in_srgb,var(--fm-hub-friction-rose)_12%,white)] text-[var(--fm-hub-friction-rose)]";
  }

  return "border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] text-[var(--fm-text)]";
}

export function FeaturedCareerCard({
  locale,
  card,
}: {
  locale: "en" | "zh";
  card: CareerPreviewCard;
}) {
  const mobileTopTypes = card.topMatchingTypes.slice(0, 2);
  const hiddenTopTypeCount = Math.max(card.topMatchingTypes.length - mobileTopTypes.length, 0);
  const mobileSignals = card.signals.slice(0, 2);
  const hiddenSignalCount = Math.max(card.signals.length - mobileSignals.length, 0);

  return (
    <article className="space-y-4 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 shadow-[var(--fm-shadow-sm)] sm:p-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${renderStanceClass(card.stance)}`}>
            {renderStanceLabel(card.stance, locale)}
          </span>
          <span className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text)]">
            {card.typeCode}
          </span>
        </div>
        <h3 className="m-0 font-serif text-xl text-[var(--fm-hub-navy-strong)]">{card.roleTitle}</h3>
        <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{card.summary}</p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-hub-decision-green)]">
              {locale === "zh" ? "Why this can fit" : "Why this can fit"}
            </p>
            <p className="mb-0 mt-2 text-sm leading-7 text-[var(--fm-text)]">{card.fitSummary}</p>
          </div>
          <div className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-hub-friction-rose)]">
              {locale === "zh" ? "Where it starts to drain" : "Where it starts to drain"}
            </p>
            <p className="mb-0 mt-2 text-sm leading-7 text-[var(--fm-text)]">{card.cautionSummary}</p>
          </div>
          <div className="space-y-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
              {locale === "zh" ? "Top matching types" : "Top matching types"}
            </p>
            <div className="flex flex-wrap gap-2 md:hidden">
              {mobileTopTypes.map((typeCode) => (
                <span
                  key={`${card.key}-${typeCode}`}
                  className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text)]"
                >
                  {typeCode}
                </span>
              ))}
              {hiddenTopTypeCount > 0 ? (
                <span className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text-muted)]">
                  +{hiddenTopTypeCount}
                </span>
              ) : null}
            </div>
            <div className="hidden flex-wrap gap-2 md:flex">
              {card.topMatchingTypes.map((typeCode) => (
                <span
                  key={`${card.key}-${typeCode}`}
                  className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text)]"
                >
                  {typeCode}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:hidden">
            {mobileSignals.map((signal) => (
              <span
                key={`${card.key}-${signal.key}`}
                className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text)]"
              >
                {signal.label} · {signal.value}
              </span>
            ))}
            {hiddenSignalCount > 0 ? (
              <span className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text-muted)]">
                +{hiddenSignalCount}
              </span>
            ) : null}
          </div>
          <div className="hidden flex-wrap gap-2 md:flex">
            {card.signals.map((signal) => (
              <span
                key={`${card.key}-${signal.key}`}
                className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text)]"
              >
                {signal.label} · {signal.value}
              </span>
            ))}
          </div>
        </div>

        <MiniStrainRadar data={card.radar} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={card.primaryCta.href} className={buttonVariants({ size: "sm" })}>
          {card.primaryCta.label}
        </Link>
        <Link href={card.secondaryCta.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
          {card.secondaryCta.label}
        </Link>
      </div>
    </article>
  );
}
