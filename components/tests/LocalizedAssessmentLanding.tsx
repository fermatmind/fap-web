import { Career94Layers, Career94Sample } from "./Career94LandingInteractions";
import { MbtiLandingReportPreview } from "./AssessmentLandingVisuals";
import { LocalizedAssessmentSchema } from "./LocalizedAssessmentSchema";
import { TrioLanding } from "./trio/TrioLanding";
import type { Entry } from "./trio/TrioLandingInteractions";
import { loadMbtiLandingPublicSample } from "@/lib/mbti/landingReportSample";
import { getLocalizedLanding } from "@/lib/tests/localized-landings";
import type { LocalizedLandingKind, LocalizedLandingLocale, LocalizedLandingProfile } from "@/lib/tests/localized-landings/types";
import type { ReactNode } from "react";

export async function LocalizedAssessmentLanding({kind, locale, entries, indexable = true, entryNote, children, profile: supplied}: {
  kind: LocalizedLandingKind;
  locale: LocalizedLandingLocale;
  entries: Entry[];
  indexable?: boolean;
  entryNote?: string;
  children?: ReactNode;
  profile?: LocalizedLandingProfile;
}) {
  const profile = supplied ?? getLocalizedLanding(locale, kind);
  const faq = profile.faq.map(([q, a]) => ({q, a}));
  const report = kind === "career" ? <Career94Sample locale={locale} labels={profile.sampleLabels} notes={profile.sampleNotes}/>
    : kind === "mbti" ? <MbtiLandingReportPreview locale={locale} sample={await loadMbtiLandingPublicSample(locale)}
      labels={profile.sampleLabels} notes={profile.sampleNotes}/> : undefined;
  return <>
    {indexable && <LocalizedAssessmentSchema kind={kind} locale={locale} profile={profile} hasEntry={entries.some(entry => Boolean(entry.href))}/>}
    <TrioLanding kind={kind} locale={locale} localizedProfile={profile} faq={faq} entries={entries} entryNote={entryNote}
      report={report} explorer={kind === "career" ? <Career94Layers locale={locale}/> : undefined} additional={children}/>
  </>;
}
