import native from "@/lib/questionnaires/catalog.json";
import legacy from "@/lib/entertainment/catalog.json";
import { ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS } from "@/lib/tracking/privacy";

const privateActivity = new Set(["attraction-experiences", "dark-tetrad-sd4", "work-traits-reflection", "work-role-reflection", "work-activity-interests", "sbti-test", "watson-glaser-practice-test", "employer-reasoning-practice-test", "asvab-science-mechanical-practice-test", "asvab-practice-test", "anger-issues-screener", "sensory-sensitivity", "misophonia-screener", "synesthesia-test", "aphantasia-test", "imposter-syndrome", "masking-test", "caliper-style-assessment-test", "career-match", "conflict-boundary-behaviors-test", "coping-rhythm-test", "dark-triad", "data-entry", "four-axes-test", "habit-patterns-test", "inner-critic-voice-test", "intimacy-preference-test", "life-path-number", "natal-chart", "nine-star-ki", "stress-response-patterns-test", "ten-key-test", "typing-speed"]);
const disabledPaths = new Set<string>(ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS);
const definitions = new Map(legacy.map(item => [item.slug, {
  slug: item.slug, title: item.title, path: `/tests/play/${item.slug}`,
  privacy: "analytics_consent", roles: ["single"],
}]));
for (const item of native) {
  const path = `/tests/${item.collection ?? "explore"}/${item.slug}`;
  definitions.set(item.slug, { slug: item.slug, title: item.title, path,
    privacy: privateActivity.has(item.slug) || disabledPaths.has(path) ? "explicit_opt_in" : "analytics_consent", roles: ["single"] });
}
definitions.set("friendship-quiz", { slug: "friendship-quiz", title: { en: "Friendship Quiz", zh: "朋友默契" },
  path: "/tests/play/friendship-quiz", privacy: "analytics_consent", roles: ["creator", "friend", "solo"] });
export const entertainmentActivityCatalog = [...definitions.values()].sort((a, b) => a.slug.localeCompare(b.slug, "en"));
