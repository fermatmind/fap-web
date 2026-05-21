import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { EQActionPrescription } from "./EQActionPrescription";
import { EQCareerEnvironmentLens } from "./EQCareerEnvironmentLens";
import { EQEmotionalMatrix } from "./EQEmotionalMatrix";
import { EQEvidenceSnapshot } from "./EQEvidenceSnapshot";
import { EQMechanismCard } from "./EQMechanismCard";
import { EQQualityBanner } from "./EQQualityBanner";
import { EQRealitySceneCards } from "./EQRealitySceneCards";
import { EQResultHero } from "./EQResultHero";
import { EQSaveShareRelated } from "./EQSaveShareRelated";
import { EQScientificBoundary } from "./EQScientificBoundary";
import { EQSJTBridgeCTA } from "./EQSJTBridgeCTA";
import { normalizeEqV5Report } from "./utils";

export function EQResultV5({
  locale,
  reportData,
  attemptId,
}: {
  locale: Locale;
  reportData: ReportResponse;
  attemptId?: string;
}) {
  const viewModel = normalizeEqV5Report(reportData, locale);

  if (!viewModel) {
    return null;
  }

  return (
    <main data-testid="eq-result-v5" className="mx-auto w-full max-w-6xl space-y-6">
      <EQResultHero viewModel={viewModel} />
      <EQEvidenceSnapshot viewModel={viewModel} />
      <EQQualityBanner viewModel={viewModel} />
      <EQEmotionalMatrix viewModel={viewModel} />
      <EQMechanismCard viewModel={viewModel} />
      <EQRealitySceneCards viewModel={viewModel} />
      <EQCareerEnvironmentLens viewModel={viewModel} />
      <EQActionPrescription viewModel={viewModel} />
      <EQSJTBridgeCTA viewModel={viewModel} />
      <EQScientificBoundary viewModel={viewModel} />
      <EQSaveShareRelated viewModel={viewModel} attemptId={attemptId} />
    </main>
  );
}
