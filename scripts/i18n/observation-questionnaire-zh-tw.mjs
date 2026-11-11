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
