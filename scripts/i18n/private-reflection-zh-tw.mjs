import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { build } from "./convert-zh-tw.mjs";
import { correctConflictReadingPrivacy } from "../../lib/questionnaires/result-content/conflict-boundary-privacy.ts";

const root = new URL("../../", import.meta.url);
const sources = {
  "annoying-person-test": "Friction",
  "breakup-reflection-test": "Breakup",
  "conflict-boundary-behaviors-test": "ConflictBoundary",
  "coping-rhythm-test": "CopingRhythm",
  "habit-patterns-test": "HabitPatterns",
  "intimacy-preference-test": "Intimacy",
  "orientation-exploration-test": "Orientation",
  "stress-response-patterns-test": "StressResponse",
};
const target = new URL("lib/i18n/zh-TW/private-reflection-questionnaires.generated.json", root);
const current = readFileSync(target, "utf8");
const conflict = "lib/questionnaires/data/conflict-boundary-behaviors-test.json";
const selector = "lib/questionnaires/result-content/conflict-boundary-privacy.ts";
const quiz = JSON.parse(readFileSync(new URL(conflict, root), "utf8"));
const overrides = {
  [conflict]: { ...quiz, profiles: quiz.profiles.map(correctConflictReadingPrivacy) },
};
const selected = [];
for (const [slug, name] of Object.entries(sources)) {
  const editorial = `components/questionnaires/${name}LandingEditorial.ts`;
  selected.push(`lib/questionnaires/data/${slug}.json`, `lib/questionnaires/result-content/${slug}.json`, editorial);
  overrides[editorial] = await import(new URL(editorial, root));
}
const { artifact } = build(JSON.parse(current), selected, overrides);
artifact.runtimeSourceHashes = {
  [selector]: createHash("sha256").update(readFileSync(new URL(selector, root))).digest("hex"),
};
const generated = JSON.stringify(artifact, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (current !== generated) throw new Error("Taiwan private reflection copy is stale");
} else {
  writeFileSync(target, generated);
}
console.log(`${Object.keys(artifact.units).length} source-bound private reflection display fields`);
