import { native, legacy } from "./clientCatalog.json";
import { GLOBAL_HISTORY_SLUG } from "./global-history/config";
import { ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS } from "@/lib/tracking/privacy";

const privateActivity = new Set(["connection-meaning-reflection", "body-frame-observations", "connection-ideals", "activity-engagement-patterns", "style-impression-preferences", "outfit-line-preferences", "attraction-experiences", "dark-tetrad-sd4", "work-traits-reflection", "work-role-reflection", "work-activity-interests", "sbti-test", "watson-glaser-practice-test", "employer-reasoning-practice-test", "asvab-science-mechanical-practice-test", "asvab-practice-test", "anger-issues-screener", "sensory-sensitivity", "misophonia-screener", "synesthesia-test", "aphantasia-test", "imposter-syndrome", "masking-test", "caliper-style-assessment-test", "career-match", "conflict-boundary-behaviors-test", "coping-rhythm-test", "dark-triad", "data-entry", "four-axes-test", "habit-patterns-test", "inner-critic-voice-test", "intimacy-preference-test", "life-path-number", "natal-chart", "nine-star-ki", "stress-response-patterns-test", "ten-key-test", "typing-speed"]);
const disabledPaths = new Set<string>(ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS);
const definitions = new Map(legacy.map(item => [item.slug, {
  slug: item.slug, path: `/tests/play/${item.slug}`,
  privacy: "analytics_consent", roles: ["single"],
}]));
for (const item of native) {
  const path = `/tests/${item.collection ?? "explore"}/${item.slug}`;
  definitions.set(item.slug, { slug: item.slug, path,
    privacy: privateActivity.has(item.slug) || disabledPaths.has(path) ? "explicit_opt_in" : "analytics_consent", roles: ["single"] });
}
definitions.set("friendship-quiz", { slug: "friendship-quiz",
  path: "/tests/play/friendship-quiz", privacy: "analytics_consent", roles: ["creator", "friend", "solo"] });
definitions.set(GLOBAL_HISTORY_SLUG, { slug: GLOBAL_HISTORY_SLUG,
  path: `/tests/play/${GLOBAL_HISTORY_SLUG}`, privacy: "analytics_consent", roles: ["single"] });
export const entertainmentActivityDefinitions = [...definitions.values()].sort((a, b) => a.slug.localeCompare(b.slug, "en"));
