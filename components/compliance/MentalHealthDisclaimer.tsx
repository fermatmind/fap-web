import type { Locale } from "@/lib/i18n/locales";
export {
  MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER,
  MENTAL_HEALTH_SCREENING_TEST_SLUGS,
  isMentalHealthScreeningTest,
} from "@/lib/compliance/mentalHealthScreening";
import { MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER } from "@/lib/compliance/mentalHealthScreening";

export function MentalHealthDisclaimer({ locale }: { locale: Locale }) {
  const title = locale === "zh" ? "非医疗诊断说明" : "Non-medical screening note";
  const body = MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER[locale];

  return (
    <section
      id="mental-health-disclaimer"
      aria-labelledby="mental-health-disclaimer-title"
      data-testid="mental-health-disclaimer"
      className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-sm leading-7 text-amber-950 shadow-[var(--fm-shadow-sm)]"
    >
      <h2 id="mental-health-disclaimer-title" className="m-0 text-base font-semibold text-amber-950">
        {title}
      </h2>
      <p className="m-0 mt-2">{body}</p>
    </section>
  );
}
