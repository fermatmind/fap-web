import { TRACKING_EVENTS, type TrackingEventName } from "@/lib/tracking/events";
import type { Locale } from "@/lib/i18n/locales";
import type { RiasecResultViewModel } from "@/lib/riasec/resultAssembler";

export const RIASEC_TRACKING_EVENTS = {
  resultView: TRACKING_EVENTS.RIASEC_RESULT_VIEW,
  shareView: TRACKING_EVENTS.RIASEC_SHARE_VIEW,
  pdfView: TRACKING_EVENTS.RIASEC_PDF_VIEW,
  activityExplorerView: TRACKING_EVENTS.RIASEC_ACTIVITY_EXPLORER_VIEW,
  feedbackOverlayView: TRACKING_EVENTS.RIASEC_FEEDBACK_OVERLAY_VIEW,
} as const satisfies Record<string, TrackingEventName>;

export type RiasecTrustedResultTrackingPayload = {
  scale_code: "RIASEC";
  form_code: string;
  score_space_version: string;
  projection_version: string;
  snapshot_bound: boolean;
  activity_explorer_status: string;
  activity_source_status: string;
  feedback_overlay_status: string;
  feedback_stream_status: string;
  raw_feedback_included: boolean;
  occupation_examples_policy: string;
  locale: Locale;
};

export function buildRiasecTrustedResultTrackingPayload(
  viewModel: RiasecResultViewModel,
  locale: Locale
): RiasecTrustedResultTrackingPayload {
  const trustedCard = viewModel.trustedResultCard;
  const activityExplorer = viewModel.activityExplorer;
  const feedbackOverlay = viewModel.feedbackOverlay;

  return {
    scale_code: "RIASEC",
    form_code: viewModel.formCode ?? "",
    score_space_version:
      trustedCard?.scoreSpaceVersion ||
      feedbackOverlay?.snapshotIdentity.scoreSpaceVersion ||
      "",
    projection_version: trustedCard?.projectionVersion ?? "",
    snapshot_bound: Boolean(trustedCard?.snapshotBound ?? feedbackOverlay?.snapshotBound),
    activity_explorer_status: activityExplorer?.status ?? "not_available",
    activity_source_status: activityExplorer?.sourceStatus ?? "not_available",
    feedback_overlay_status: feedbackOverlay?.status ?? "not_available",
    feedback_stream_status: feedbackOverlay?.feedbackStreamStatus ?? "not_available",
    raw_feedback_included: Boolean(feedbackOverlay?.readModel.rawFeedbackIncluded),
    occupation_examples_policy:
      trustedCard?.occupationExamplesPolicy ||
      activityExplorer?.occupationExamplesPolicy ||
      "",
    locale,
  };
}
