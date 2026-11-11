import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { build } from "./convert-zh-tw.mjs";

const root = new URL("../../", import.meta.url);
const output = new URL("lib/i18n/zh-TW/observation-questionnaires.generated.json", root);
const sources = [
  "lib/questionnaires/data/care-feelings-reflection.json",
  "lib/questionnaires/result-content/care-feelings-reflection.json",
  "components/questionnaires/CareFeelingsLandingEditorial.ts",
  "lib/questionnaires/data/connection-belonging-check-in.json",
  "lib/questionnaires/result-content/connection-belonging-check-in.json",
  "components/questionnaires/ConnectionCheckInLandingEditorial.ts",
  "lib/questionnaires/data/disconnection-experiences-reflection.json",
  "lib/questionnaires/result-content/disconnection-experiences-reflection.json",
  "components/questionnaires/DisconnectionLandingEditorial.ts",
  "lib/questionnaires/data/emotions-connections-reflection.json",
  "lib/questionnaires/result-content/emotions-connections-reflection.json",
  "components/questionnaires/EmotionsConnectionsLandingEditorial.ts",
  "lib/questionnaires/data/feelings-connection-reflection.json",
  "lib/questionnaires/result-content/feelings-connection-reflection.json",
  "components/questionnaires/FeelingsConnectionLandingEditorial.ts",
  "lib/questionnaires/data/social-context-reflection.json",
  "lib/questionnaires/result-content/social-context-reflection.json",
  "components/questionnaires/SocialContextLandingEditorial.ts",
  "lib/questionnaires/data/communication-routines-context.json",
  "lib/questionnaires/result-content/communication-routines-context.json",
  "components/questionnaires/CommunicationRoutinesLandingEditorial.ts",
  "lib/questionnaires/data/focus-energy-context-reflection.json",
  "lib/questionnaires/result-content/focus-energy-context-reflection.json",
  "components/questionnaires/FocusContextLandingEditorial.ts",
  "lib/questionnaires/data/number-context-reflection.json",
  "lib/questionnaires/result-content/number-context-reflection.json",
  "components/questionnaires/NumberContextLandingEditorial.ts",
  "lib/questionnaires/data/spatial-thinking-reflection.json",
  "lib/questionnaires/result-content/spatial-thinking-reflection.json",
  "components/questionnaires/SpatialContextLandingEditorial.ts",
  "lib/questionnaires/data/unfamiliar-experiences-reflection.json",
  "lib/questionnaires/result-content/unfamiliar-experiences-reflection.json",
  "components/questionnaires/UnfamiliarLandingEditorial.ts",
  "lib/questionnaires/data/written-language-context-reflection.json",
  "lib/questionnaires/result-content/written-language-context-reflection.json",
  "components/questionnaires/WrittenLanguageLandingEditorial.ts",
  "lib/questionnaires/data/after-childbirth-context-reflection.json",
  "lib/questionnaires/result-content/after-childbirth-context-reflection.json",
  "components/questionnaires/BirthContextLandingEditorial.ts",
  "lib/questionnaires/data/menstrual-cycle-context-reflection.json",
  "lib/questionnaires/result-content/menstrual-cycle-context-reflection.json",
  "components/questionnaires/CycleContextLandingEditorial.ts",
  "lib/questionnaires/data/time-of-year-context-reflection.json",
  "lib/questionnaires/result-content/time-of-year-context-reflection.json",
  "components/questionnaires/SeasonContextLandingEditorial.ts",
  "lib/questionnaires/data/sleep-experiences-reflection.json",
  "lib/questionnaires/result-content/sleep-experiences-reflection.json",
  "components/questionnaires/SleepExperiencesLandingEditorial.ts",
  "lib/questionnaires/data/eating-experiences-reflection.json",
  "lib/questionnaires/result-content/eating-experiences-reflection.json",
  "components/questionnaires/EatingExperiencesLandingEditorial.ts",
  "lib/questionnaires/data/drinking-experiences-reflection.json",
  "lib/questionnaires/result-content/drinking-experiences-reflection.json",
  "components/questionnaires/DrinkingExperiencesLandingEditorial.ts",
  "lib/questionnaires/data/after-bereavement-reflection.json",
  "lib/questionnaires/result-content/after-bereavement-reflection.json",
  "components/questionnaires/BereavementLandingEditorial.ts",
  "lib/questionnaires/data/child-focus-activity-observations.json",
  "lib/questionnaires/result-content/child-focus-activity-observations.json",
  "components/questionnaires/CaregiverContextLandingEditorial.ts",
  "lib/questionnaires/data/gender-experiences-reflection.json",
  "lib/questionnaires/result-content/gender-experiences-reflection.json",
  "components/questionnaires/GenderExperiencesLandingEditorial.ts",
  "lib/questionnaires/data/health-worries-reflection.json",
  "lib/questionnaires/result-content/health-worries-reflection.json",
  "components/questionnaires/HealthWorryLandingEditorial.ts",
  "lib/questionnaires/data/sudden-fear-reflection.json",
  "lib/questionnaires/result-content/sudden-fear-reflection.json",
  "components/questionnaires/SuddenFearLandingEditorial.ts",
  "lib/questionnaires/data/trauma-response-reflection.json",
  "lib/questionnaires/result-content/trauma-response-reflection.json",
  "components/questionnaires/TraumaResponseLandingEditorial.ts",
  "lib/questionnaires/data/everyday-worry-reflection.json",
  "lib/questionnaires/result-content/everyday-worry-reflection.json",
  "components/questionnaires/EverydayWorryLandingEditorial.ts",
  "lib/questionnaires/data/feedback-self-worth-reflection.json",
  "lib/questionnaires/result-content/feedback-self-worth-reflection.json",
  "components/questionnaires/FeedbackWorthLandingEditorial.ts",
  "lib/questionnaires/data/recent-mood-reflection.json",
  "lib/questionnaires/result-content/recent-mood-reflection.json",
  "components/questionnaires/RecentMoodLandingEditorial.ts",
  "lib/questionnaires/data/uncertainty-ease-reflection.json",
  "lib/questionnaires/result-content/uncertainty-ease-reflection.json",
  "components/questionnaires/UncertaintyEaseLandingEditorial.ts",
  "lib/questionnaires/data/unwanted-thoughts-actions-reflection.json",
  "lib/questionnaires/result-content/unwanted-thoughts-actions-reflection.json",
  "components/questionnaires/UnwantedActionsLandingEditorial.ts",
  "lib/questionnaires/data/considering-support-reflection.json",
  "lib/questionnaires/result-content/considering-support-reflection.json",
  "components/questionnaires/SupportReflectionLandingEditorial.ts",
  "lib/questionnaires/data/mood-activity-changes-reflection.json",
  "lib/questionnaires/result-content/mood-activity-changes-reflection.json",
  "components/questionnaires/MoodActivityLandingEditorial.ts",
  "lib/questionnaires/data/pressure-response-actions.json",
  "lib/questionnaires/result-content/pressure-response-actions.json",
  "components/questionnaires/PressureActionsLandingEditorial.ts",
];

const previous = readFileSync(output, "utf8");
const editorials = Object.fromEntries(await Promise.all(sources.map(async path => {
  const file = new URL(path, root);
  const value = path.endsWith("LandingEditorial.ts") ? await import(file) : JSON.parse(readFileSync(file, "utf8"));
  return [path, value];
})));
const { artifact, snapshots } = build(JSON.parse(previous), sources, editorials);
const next = JSON.stringify(artifact, null, 2) + "\n";
if (previous !== next) {
  if (process.argv.includes("--check")) throw new Error("Taiwan observation questionnaire sources changed");
  if (readFileSync(output, "utf8") !== previous ||
      Object.entries(snapshots).some(([path, raw]) => readFileSync(new URL(path, root), "utf8") !== raw)) {
    throw new Error("Taiwan observation questionnaire sources or target changed during generation");
  }
  const temporary = new URL(output.href + "." + process.pid + ".tmp");
  writeFileSync(temporary, next, { flag: "wx" });
  renameSync(temporary, output);
}
console.log(`zh-TW observation questionnaires: ${Object.keys(artifact.units).length} source-bound strings`);
